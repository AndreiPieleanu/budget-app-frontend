"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/app/helpers/helpers";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import CreateSheetForm from "@/components/sheets/CreateSheetForm";
import SheetList from "@/components/sheets/SheetList";

type Sheet = {
    id: number;
    name: string;
};

export default function SheetPage() {
    const [sheets, setSheets] = useState<Sheet[]>([]);
    const [addLoading, setAddLoading] = useState(false);
    const [loadingSheets, setLoadingSheets] = useState(false);
    const router = useRouter();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        const loadPage = async () => {
            setLoadingSheets(true)
            try {
                const res = await authFetch(`sheets/me`);
                const data = await res.json();

                setSheets(data);
                setLoadingSheets(false)
            } catch (error: any) {
                enqueueSnackbar(error.message, {
                    variant: "error",
                });
                if (error.message.includes("Session expired")) {
                    router.push("/");
                }
            }
        };

        loadPage();
    }, [router]);

    const createSheet = async (name: string) => {
        if (!name) {
            enqueueSnackbar("Error! Please add name!", { variant: "error" })
            return;
        }
        try {
            setAddLoading(true)
            const res = await authFetch(`sheets`, {
                method: "POST",
                body: { name },
            });

            const newSheet = await res.json();
            setSheets(prev => [...prev, newSheet]);
        } catch (e: any) {
            enqueueSnackbar(`An error occurred! ${e}`);
        } finally {
            setAddLoading(false);
        }
    };

    const startEdit = (sheet: Sheet) => {
        setEditingId(sheet.id);
        setEditName(sheet.name);
    };

    const saveEdit = async (sheetId: number, name: string) => {
        const foundSheet = sheets.find((s) => s.id === sheetId);
        if (!foundSheet) {
            enqueueSnackbar("Error! Source not found!", {
                variant: "error",
            })
            return;
        }
        const updated = {
            ...foundSheet,
            name,
        };

        setSheets((prev) =>
            prev.map((s) => (s.id === sheetId ? updated : s))
        );

        try {
            await authFetch(`sheets/${sheetId}`, {
                method: "PUT",
                body: { name },
            });

            enqueueSnackbar("Item updated", {
                variant: "success",
                action: (snackbarId) => (
                    <button
                        onClick={async () => {
                            const res = await authFetch(
                                `sheets/${sheetId}`,
                                {
                                    method: "PUT",
                                    body: {
                                        name: foundSheet.name
                                    },
                                }
                            );

                            const restored = await res.json();

                            setSheets((prev) =>
                                prev.map((s) => (s.id === sheetId ? restored : s))
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

    const deleteSheet = async (sheetId: number) => {
        const foundSheet = sheets.find((s) => s.id === sheetId);
        if (!foundSheet) {
            enqueueSnackbar("Error! Source not found!", {
                variant: "error",
            })
            return;
        }
        setSheets(prev => prev.filter(s => s.id !== sheetId));
        try {
            await authFetch(`sheets/${sheetId}`, {
                method: "DELETE",
            });
            enqueueSnackbar("Item deleted", {
                variant: "success",
                action: (snackbarId) => (
                    <button
                        onClick={async () => {
                            const res = await authFetch(`sheets`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: {
                                    name: foundSheet.name,
                                },
                            });

                            const restored = await res.json();

                            setSheets((prev) => [
                                ...prev,
                                restored,
                            ]);

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

    if (loadingSheets) {
        return (
            <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
                <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6 sm:space-y-8">
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-300">
                            Loading sheets... please wait
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6 sm:space-y-8">
                <CreateSheetForm
                    onCreate={createSheet}
                    isLoading={addLoading}
                />
                <SheetList
                    sheets={sheets}
                    editingId={editingId}
                    editName={editName}
                    setEditName={setEditName}
                    setEditingId={setEditingId}
                    onSaveEdit={saveEdit}
                    onDelete={deleteSheet}
                    onStartEdit={startEdit}
                />
            </section>
        </main>
    );
}
