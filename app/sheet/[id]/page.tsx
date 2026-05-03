"use client";

import {useCallback, useEffect, useState} from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {Sankey, Tooltip} from "recharts";
import {authFetch} from "@/app/helpers/helpers";
import {closeSnackbar, useSnackbar} from "notistack";

type Source = {
    id: number;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    currency: "EUR" | "RON" | "HUF" | "ZAR" | "USD";
};

export default function SheetPage() {
    const { id } = useParams();

    const [sources, setSources] = useState<Source[]>([]);
    const [convertedSources, setConvertedSources] = useState<Source[]>([]);
    const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
    const [currency, setCurrency] = useState<"EUR" | "RON" | "HUF" | "ZAR" | "USD">("HUF");
    const [currencyTo, setCurrencyTo] = useState<"EUR" | "RON" | "HUF" | "ZAR" | "USD">("HUF");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const [showGraph, setShowGraph] = useState(false);

    const [sheetName, setSheetName] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [loadingSources, setLoadingSources] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

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

    const createSource = async () => {
        if(!description || !amount){
            enqueueSnackbar("Error! Please add description and amount!", {variant: "error"})
            setAddLoading(false)
            return;
        }
        try{
            setAddLoading(true)
            const res = await authFetch(`sources`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: {
                    type,
                    amount: Number(amount),
                    description,
                    sheetId: Number(id),
                    currency
                },
            });

            setAmount("");
            setDescription("");
            const created = await res.json();

            setSources(prev => [...prev, created]);
        } catch (e){
            enqueueSnackbar(`An error occurred! ${e}`);
        } finally {
            setAddLoading(false);
        }
    };

    const deleteSource = async (sourceId: number) => {
        const foundSource = sources.find((s) => s.id === sourceId);
        if(!foundSource) {
            enqueueSnackbar("Error! Source not found!", {
                variant: "error",
            })
            return;
        }
        setSources(prev => prev.filter(s => s.id !== sourceId));
        await authFetch(`sources/${sourceId}`, {
            method: "DELETE",
        });
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
                                currency: foundSource.currency
                            },
                        });
                        const restored = await res.json();
                        setSources((prev) => [
                            ...prev,
                            restored,
                        ]);

                        closeSnackbar(snackbarId);
                    }}
                    className="font-bold"
                >
                    Undo
                </button>
            )
        });
    };

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editAmount, setEditAmount] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editType, setEditType] = useState<"INCOME" | "EXPENSE">("INCOME");
    const [editCurrency, setEditCurrency] = useState<"EUR" | "RON" | "HUF" | "ZAR" | "USD">("HUF");

    const startEdit = (src: Source) => {
        setEditingId(src.id);
        setEditAmount(String(src.amount));
        setEditDescription(src.description);
        setEditType(src.type);
        setEditCurrency(src.currency);
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
            type: editType,
            amount: Number(editAmount),
            description: editDescription,
            currency: editCurrency
        };

        // optimistic update
        setSources((prev) =>
            prev.map((s) => (s.id === sourceId ? updated : s))
        );

        await authFetch(`sources/${sourceId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: {
                type: editType,
                amount: Number(editAmount),
                description: editDescription,
                sheetId: Number(id),
                currency: editCurrency
            },
        });

        enqueueSnackbar("Item updated", {
            variant: "success",
            action: (snackbarId) => (
                <button
                    onClick={async () => {
                        const res = await authFetch(
                            `sources/${sourceId}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },
                                body: {
                                    type: foundSource.type,
                                    amount: foundSource.amount,
                                    description: foundSource.description,
                                    sheetId: Number(id),
                                    currency: foundSource.currency
                                },
                            }
                        );

                        const restored = await res.json();

                        // replace, don't append
                        setSources((prev) =>
                            prev.map((s) =>
                                s.id === sourceId
                                    ? restored
                                    : s
                            )
                        );

                        closeSnackbar(snackbarId);
                    }}
                    className="font-bold"
                >
                    Undo
                </button>
            ),
        });

        setEditingId(null);
    };

    const buildSankeyData = (sources: Source[]) => {
        const incomes = sources.filter(s => s.type === "INCOME");
        const expenses = sources.filter(s => s.type === "EXPENSE");

        const nodes: any[] = [];
        const links: any[] = [];

        // ---- INCOME NODES ----
        incomes.forEach((inc) => {
            nodes.push({
                name: `${inc.description}`,
                color: "#16a34a",
            });
        });

        // ---- TOTAL NODE ----
        const totalIncome = incomes.reduce((a, b) => a + b.amount, 0);

        const totalIndex = nodes.length;
        nodes.push({
            name: `Total`,
            color: "#2563eb",
        });

        // income → total
        incomes.forEach((inc, i) => {
            links.push({
                source: i,
                target: totalIndex,
                value: inc.amount,
            });
        });

        // ---- EXPENSE NODES ----
        let totalExpense = 0;

        expenses.forEach((exp) => {
            const idx = nodes.length;

            nodes.push({
                name: `${exp.description}`,
                color: "#dc2626",
            });

            links.push({
                source: totalIndex,
                target: idx,
                value: exp.amount,
            });

            totalExpense += exp.amount;
        });

        // ---- REMAINDER NODE ----
        const remainder = parseFloat((totalIncome - totalExpense).toFixed(2));

        if (remainder > 0) {
            const remainderIndex = nodes.length;

            nodes.push({
                name: `Remaining`,
                color: "#0ea5e9",
            });

            links.push({
                source: totalIndex,
                target: remainderIndex,
                value: remainder,
            });
        }

        return { nodes, links };
    };
    const CustomNode = ({ x, y, width, height, payload }: any) => {
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={payload.color}
                    rx={10}
                    opacity={0.95}
                />

                <text
                    x={x + width + 10}
                    y={y + height / 2}
                    fontSize={13}
                    dominantBaseline="middle"
                    fill="#e2e8f0"
                    fontWeight="600"
                >
                    {payload.name} {payload.value}
                </text>
            </g>
        );
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;

        const d = payload?.[0]?.payload ?? payload?.[0];

        return (
            <div className="rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-2xl text-white min-w-[160px]">
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-slate-300 mt-1">
                    Amount: <span className="text-emerald-400 font-medium">{d.value}</span>
                </p>
            </div>
        );
    };

    const Graph = ({ sources }: { sources: Source[] }) => {
        const data = buildSankeyData(sources);

        const totalIncome = sources
            .filter((s) => s.type === "INCOME")
            .reduce((sum, s) => sum + Number(s.amount), 0);

        const totalExpense = sources
            .filter((s) => s.type === "EXPENSE")
            .reduce((sum, s) => sum + Number(s.amount), 0);

        const balance = Number((totalIncome - totalExpense).toFixed(2));

        const nodeCount = data.nodes.length;

        // responsive width
        const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
        const width = isMobile
            ? Math.max(600, nodeCount * 70)
            : Math.max(900, nodeCount * 90);

        const height = isMobile ? 420 : 520;

        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">

                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Money Flow Overview
                    </h2>

                    <p className="text-slate-300 mt-1 sm:mt-2 text-sm sm:text-base">
                        Visualize how income moves into expenses and savings.
                    </p>
                </div>

                {/* Graph */}
                <div className="overflow-x-auto rounded-2xl bg-slate-950/70 border border-white/5 p-3 sm:p-4">
                    <div style={{ width }}>
                        <Sankey
                            width={width}
                            height={height}
                            data={data}
                            node={<CustomNode />}
                            nodePadding={isMobile ? 10 : 14}
                            margin={{
                                left: isMobile ? 20 : 50,
                                right: isMobile ? 120 : 180,
                                top: 20,
                                bottom: 20,
                            }}
                            link={{ strokeOpacity: 0.35 }}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Sankey>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-slate-400">Income</p>
                        <p className="text-lg sm:text-xl font-bold text-emerald-400">
                            {totalIncome.toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-slate-400">Expenses</p>
                        <p className="text-lg sm:text-xl font-bold text-rose-400">
                            {totalExpense.toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-slate-400">
                            {balance >= 0 ? "Remaining" : "Deficit"}
                        </p>

                        <p
                            className={`text-lg sm:text-xl font-bold ${
                                balance >= 0
                                    ? "text-sky-400"
                                    : "text-amber-400"
                            }`}
                        >
                            {Math.abs(balance).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Deficit warning */}
                {balance < 0 && (
                    <div className="mt-4 sm:mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 sm:px-4 py-2 sm:py-3">
                        <p className="text-amber-300 font-medium text-sm sm:text-base">
                            You spent {Math.abs(balance).toFixed(2)} more than you earned.
                        </p>
                    </div>
                )}
            </div>
        );
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

                {/* Header */}
                <div className="space-y-3">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            {sheetName}
                        </h1>
                        <p className="text-slate-300 mt-2 text-sm sm:text-base">
                            Track income and expenses with clarity.
                        </p>
                    </div>
                </div>

                {/* Add Source */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                        Add Transaction
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Select
                            value={type}
                            onValueChange={(v: any) => setType(v)}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INCOME">Income</SelectItem>
                                <SelectItem value="EXPENSE">Expense</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                        />

                        <Input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={0}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                        />

                        <Select
                            value={currency}
                            onValueChange={(v: any) => setCurrency(v)}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EUR">Euros</SelectItem>
                                <SelectItem value="RON">Romanian rons</SelectItem>
                                <SelectItem value="HUF">Hungarian forints</SelectItem>
                                <SelectItem value="ZAR">South African rands</SelectItem>
                                <SelectItem value="USD">US dollars</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={createSource}
                            disabled={addLoading}
                            className="w-full lg:w-auto rounded-2xl text-black bg-emerald-500 hover:bg-emerald-400 font-semibold active:scale-[0.98]"
                        >
                            {addLoading ? (
                                <>
                                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add"
                            )}
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    <span>Select currency to convert to:</span>

                    <Select
                        value={currencyTo}
                        onValueChange={(v: any) => setCurrencyTo(v)}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EUR">Euros</SelectItem>
                            <SelectItem value="RON">Romanian rons</SelectItem>
                            <SelectItem value="HUF">Hungarian forints</SelectItem>
                            <SelectItem value="ZAR">South African rands</SelectItem>
                            <SelectItem value="USD">US dollars</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={async () => {
                            const res = await authFetch(`sources/convert?sheetId=${id}&currencyTo=${currencyTo}`, {
                                method: "GET",
                                headers: { "Content-Type": "application/json" },
                            });
                            const resList = await res.json();
                            setConvertedSources(resList)
                            setShowGraph(true);
                        }}
                        className="w-full sm:w-auto rounded-2xl bg-sky-500 hover:bg-sky-400 font-semibold text-black"
                    >
                        Generate Graph
                    </Button>
                </div>

                {/* MOBILE LIST */}
                <div className="space-y-3 sm:hidden">
                    {sources.map((src) => (
                        <div
                            key={src.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                            {editingId === src.id ? (
                                <>
                                    <Input
                                        value={editDescription}
                                        onChange={(e) =>
                                            setEditDescription(e.target.value)
                                        }
                                        className="mb-3 bg-white/5 border-white/10 text-white"
                                    />

                                    <div className="flex gap-2 mb-3">
                                        <Select
                                            value={editType}
                                            onValueChange={(v: any) =>
                                                setEditType(v)
                                            }
                                        >
                                            <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INCOME">Income</SelectItem>
                                                <SelectItem value="EXPENSE">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) =>
                                                setEditAmount(e.target.value)
                                            }
                                            className="flex-1 bg-white/5 border-white/10 text-white"
                                        />

                                        <Select
                                            value={editCurrency}
                                            onValueChange={(v: any) => setEditCurrency(v)}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EUR">Euros</SelectItem>
                                                <SelectItem value="RON">Romanian rons</SelectItem>
                                                <SelectItem value="HUF">Hungarian forints</SelectItem>
                                                <SelectItem value="ZAR">South African rands</SelectItem>
                                                <SelectItem value="USD">US dollars</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => saveEdit(src.id)}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-400"
                                        >
                                            Save
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingId(null)}
                                            className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">
                                        {src.description}
                                    </span>

                                        <span
                                            className={`font-semibold ${
                                                src.type === "INCOME"
                                                    ? "text-emerald-400"
                                                    : "text-rose-400"
                                            }`}
                                        >
                                            {src.amount} {src.currency}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => startEdit(src)}
                                            className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            onClick={() => deleteSource(src.id)}
                                            className="flex-1"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden sm:block rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl overflow-hidden">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-slate-400">
                                    Description
                                </TableHead>
                                <TableHead className="text-slate-400">
                                    Income
                                </TableHead>
                                <TableHead className="text-slate-400">
                                    Expense
                                </TableHead>
                                <TableHead className="text-slate-200">
                                    Currency
                                </TableHead>
                                <TableHead className="text-right text-slate-400">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sources.map((src) => (
                                <TableRow
                                    key={src.id}
                                    className="border-white/10 hover:bg-white/5 transition"
                                >
                                    {editingId === src.id ? (
                                        <>
                                            <TableCell>
                                                <Input
                                                    value={editDescription}
                                                    onChange={(e) =>
                                                        setEditDescription(e.target.value)
                                                    }
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </TableCell>

                                            <TableCell colSpan={2}>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={editType}
                                                        onValueChange={(v: any) =>
                                                            setEditType(v)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="INCOME">Income</SelectItem>
                                                            <SelectItem value="EXPENSE">Expense</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={(e) =>
                                                            setEditAmount(e.target.value)
                                                        }
                                                        className="bg-white/5 border-white/10 text-white"
                                                    />
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Select
                                                    value={editCurrency}
                                                    onValueChange={(v: any) => setEditCurrency(v)}
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="EUR">Euros</SelectItem>
                                                        <SelectItem value="RON">Romanian rons</SelectItem>
                                                        <SelectItem value="HUF">Hungarian forints</SelectItem>
                                                        <SelectItem value="ZAR">South African rands</SelectItem>
                                                        <SelectItem value="USD">US dollars</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => saveEdit(src.id)}
                                                        className="bg-emerald-500 hover:bg-emerald-400"
                                                    >
                                                        Save
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setEditingId(null)}
                                                        className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="font-medium">
                                                {src.description}
                                            </TableCell>

                                            <TableCell className="text-emerald-400 font-semibold">
                                                {src.type === "INCOME" ? src.amount : ""}
                                            </TableCell>

                                            <TableCell className="text-rose-400 font-semibold">
                                                {src.type === "EXPENSE" ? src.amount : ""}
                                            </TableCell>

                                            <TableCell className="font-semibold">
                                                {src.currency}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => startEdit(src)}
                                                        className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => deleteSource(src.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Graph */}
                {showGraph && (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                            Overview Graph
                        </h2>
                        <Graph sources={convertedSources} />
                    </div>
                )}
            </section>
        </main>
    );
}