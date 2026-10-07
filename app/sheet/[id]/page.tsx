"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { authFetch, createLog } from "@/app/helpers/helpers";
import { closeSnackbar, useSnackbar } from "notistack";
import TransactionForm from "@/components/sheet-details/TransactionForm";
import CurrencyControls from "@/components/sheet-details/CurrencyControls";
import MoneyFlowGraph from "@/components/sheet-details/SankeyGraph";
import SourceList from "@/components/sheet-details/SourceList";
import ActivityLogs from "@/components/sheet-details/ActivityLogs";

type Source = {
    id: number;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    currency: "EUR" | "RON" | "HUF" | "ZAR" | "USD";
    actualAmount: number;
    possibleStartDate: string;
    possibleEndDate: string;
};

type Timeline = {
    id: number;
    description: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    currency: "EUR" | "RON" | "HUF" | "ZAR" | "USD";
    startDate: string;
    endDate: string;
};

type LogsEvent = {
    id: number;
    message: string;
    createdAt: string;
    email: string;
}

export default function SheetPage() {
    const { id } = useParams();
    const today = new Date().toISOString().split("T")[0];

    const [sources, setSources] = useState<Source[]>([]);
    const [convertedSources, setConvertedSources] = useState<Source[]>([]);
    const [convertedTimelines, setConvertedTimelines] = useState<Timeline[]>([]);
    const [currency, setCurrency] = useState<"EUR" | "RON" | "HUF" | "ZAR" | "USD">("HUF");
    const [currencyTo, setCurrencyTo] = useState<"EUR" | "RON" | "HUF" | "ZAR" | "USD">("HUF");
    const [showGraph, setShowGraph] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);

    const [sheetName, setSheetName] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [loadingSources, setLoadingSources] = useState(false);

    const [logs, setLogs] = useState<LogsEvent[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    const { enqueueSnackbar } = useSnackbar();

    const loadLogs = async () => {
        setLoadingLogs(true);
        try {
            const res = await authFetch(`logs/user/${1}`);
            const data = await res.json();
            setLogs(data);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        const loadPage = async () => {
            setLoadingSources(true)
            try {
                const [sourcesRes, sheetRes] = await Promise.all([
                    authFetch(`sources/sheet/${id}`),
                    authFetch(`sheets/${id}`)
                ]);

                const [sourcesData, sheetData] = await Promise.all([
                    sourcesRes.json(),
                    sheetRes.json()
                ]);

                setSources(sourcesData);
                setSheetName(sheetData.name);
                setLoadingSources(false)

            } catch (error: any) {
                enqueueSnackbar(error.message, {
                    variant: "error",
                });
            }
        };

        loadPage();
    }, [enqueueSnackbar, id]);

    const createSource = async (data: any) => {
        if (!data.description || !data.amount) {
            enqueueSnackbar("Error! Please add description and amount!", { variant: "error" })
            return;
        }
        try {
            setAddLoading(true)
            const res = await authFetch(`sources`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: {
                    ...data,
                    sheetId: Number(id),
                },
            });
            await createLog(
                `Added ${data.type.toLowerCase()} source '${data.description}' to sheet '${sheetName}' with estimated amount ${data.amount} ${data.currency} between ${data.possibleStartDate} and ${data.possibleEndDate}.`
            ).catch(console.error);

            const created = await res.json();
            setSources(prev => [...prev, created]);
        } catch (e: any) {
            enqueueSnackbar(`An error occurred! ${e}`);
        } finally {
            setAddLoading(false);
        }
    };

    const deleteSource = async (sourceId: number) => {
        const foundSource = sources.find((s) => s.id === sourceId);
        if (!foundSource) {
            enqueueSnackbar("Error! Source not found!", {
                variant: "error",
            })
            return;
        }
        setSources(prev => prev.filter(s => s.id !== sourceId));
        try {
            await authFetch(`sources/${sourceId}`, {
                method: "DELETE",
            });
            await createLog(
                `Deleted source '${foundSource.description}' from sheet '${sheetName}'.`
            ).catch(console.error);
            enqueueSnackbar("Item deleted", {
                variant: "success",
                action: (snackbarId) => (
                    <button
                        onClick={async () => {
                            const res = await authFetch(`sources`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: {
                                    type: foundSource.type,
                                    amount: foundSource.amount,
                                    description: foundSource.description,
                                    sheetId: id,
                                    currency: foundSource.currency,
                                    actualAmount: foundSource.actualAmount,
                                    possibleStartDate: foundSource.possibleStartDate,
                                    possibleEndDate: foundSource.possibleEndDate
                                },
                            });
                            await createLog(
                                `Restored former deleted source '${foundSource.description}' back to sheet '${sheetName}'.`
                            ).catch(console.error);
                            const restored = await res.json();
                            setSources((prev) => [...prev, restored]);
                            closeSnackbar(snackbarId);
                        }
                    }
                        className="font-bold"
                    >
                        Undo
                    </button>
                )
            });
        } catch (e: any) {
            enqueueSnackbar(`An error occurred! ${e}`, { variant: "error" });
        }
    };

    const startEdit = (src: Source) => {
        setEditingId(src.id);
        setEditValues({
            amount: String(src.amount),
            description: src.description,
            type: src.type,
            currency: src.currency,
            actualAmount: String(src.actualAmount),
            possibleStartDate: src.possibleStartDate ?? today,
            possibleEndDate: src.possibleEndDate ?? today
        });
    };

    const saveEdit = async (sourceId: number) => {
        const foundSource = sources.find((s) => s.id === sourceId);
        if (!foundSource) {
            enqueueSnackbar("Error! Source not found!", {
                variant: "error",
            });
            return;
        }

        const updated = {
            ...foundSource,
            ...editValues,
            amount: Number(editValues.amount),
            actualAmount: Number(editValues.actualAmount),
        };

        setSources((prev) =>
            prev.map((s) => (s.id === sourceId ? updated : s))
        );

        try {
            await authFetch(`sources/${sourceId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: {
                    ...editValues,
                    amount: Number(editValues.amount),
                },
            });
            await createLog(
                `Updated source '${foundSource.description}' in sheet '${sheetName}':
                amount ${foundSource.amount} ${foundSource.currency} -> ${editValues.amount} ${editValues.currency},
                date range ${foundSource.possibleStartDate} - ${foundSource.possibleEndDate}
                -> ${editValues.possibleStartDate} - ${editValues.possibleEndDate}.`
            ).catch(console.error);

            enqueueSnackbar("Item updated", {
                variant: "success",
                action: (snackbarId) => (
                    <button
                        onClick={async () => {
                            const res = await authFetch(
                                `sources/${sourceId}`,
                                {
                                    method: "PUT",
                                    body: {
                                        ...foundSource,
                                    },
                                },
                            );
                            await createLog(
                                `Restored source '${foundSource.description}' in sheet '${sheetName}' back to its original state: amount ${foundSource.amount} ${foundSource.currency}, date range ${foundSource.possibleStartDate} - ${foundSource.possibleEndDate}.`
                            ).catch(console.error);
                            const restored = await res.json();
                            setSources((prev) =>
                                prev.map((s) => (s.id === sourceId ? restored : s))
                            );
                            closeSnackbar(snackbarId);
                        }
                    }
                        className="font-bold"
                    >
                        Undo
                    </button>
                )
            });
        } catch (e: any) {
            enqueueSnackbar(`An error occurred! ${e}`, { variant: "error" });
        }
        setEditingId(null);
    };

    const handleGenerateGraph = async () => {
        try {
            const res = await authFetch(`sources/convert?sheetId=${id}&currencyTo=${currencyTo}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const resList = await res.json();
            setConvertedSources(resList)
            setShowGraph(true);
        } catch (e: any) {
            enqueueSnackbar(`An error occurred! ${e}`, { variant: "error" });
        }
    };

    const handleGenerateTimeline = async () => {
        try {
            const res = await authFetch(`sources/${id}/timeline`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const resList = await res.json();
            setConvertedTimelines(resList);
            setShowTimeline(true);
        } catch (e: any) {
            enqueueSnackbar(`An error occurred! ${e}`, { variant: "error" });
        }
    };

    if (loadingSources) {
        return (
            <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
                <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6 sm:space-y-8">
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-300">
                            Loading sources... please wait
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6 sm:space-y-8">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">{sheetName}</h1>
                </div>
                <TransactionForm
                    onSubmit={createSource}
                    isLoading={addLoading}
                />
                <CurrencyControls
                    currencyTo={currencyTo}
                    setCurrencyTo={setCurrencyTo}
                    onGenerateGraph={handleGenerateGraph}
                    onGenerateTimeline={handleGenerateTimeline}
                    onShowLogs={loadLogs}
                />
                <SourceList
                    sources={sources}
                    editingId={editingId}
                    editValues={editValues}
                    setEditValues={setEditValues}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onDelete={deleteSource}
                    setEditingId={setEditingId}
                />
                {showGraph && (
                    <MoneyFlowGraph sources={convertedSources} />
                )}
                {showTimeline && (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                            Timeline
                        </h2>
                        <div className="space-y-3">
                            {convertedTimelines.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full ${item.type === "INCOME" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                        <span className="text-sm font-medium">{item.description}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-slate-400">{item.startDate} to {item.endDate}</span>
                                        <span className={`text-sm font-bold ${item.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}>
                                            {item.amount} {item.currency}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <ActivityLogs logs={logs} isLoading={loadingLogs} />
            </section>
        </main>
    );
}
