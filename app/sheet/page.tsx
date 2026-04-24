"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {authFetch} from "@/app/helpers/helpers";
import {useSnackbar} from "notistack";
import Link from "next/link";
import Logo from "@/components/ui/logo";

type Sheet = {
    id: number;
    name: string;
};

export default function SheetPage() {
    const [sheets, setSheets] = useState<Sheet[]>([]);
    const [name, setName] = useState("");
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const loadSheets = async () => {
        authFetch(`sheets/me`)
            .then(res => res.json())
            .then(setSheets);
    };
    useEffect(() => {
        const loadPage = async () => {
            try {
                const res = await authFetch(`sheets/me`);
                const data = await res.json();

                setSheets(data);
            } catch (error: any) {
                enqueueSnackbar(error.message, {
                    variant: "error",
                });
            }
        };

        loadPage();
    }, []);

    const createSheet = async () => {
        if (!name) return;
        const token = localStorage.getItem("token");
        const res = await authFetch(`sheets`, {
            method: "POST",
            body: {name},
        });

        const newSheet = await res.json();
        setSheets(prev => [...prev, newSheet]);
        setName("");
    };
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const startEdit = (sheet: Sheet) => {
        setEditingId(sheet.id);
        setEditName(sheet.name);
    };
    const saveEdit = async (sourceId: number) => {
        const token = localStorage.getItem("token");
        await authFetch(`sheets/${sourceId}`, {
            method: "PUT",
            body: {name: editName},
        });

        setEditingId(null);
        await loadSheets();
    };

    const deleteSheet = async (sheetId: number) => {
        await authFetch(`sheets/${sheetId}`, {
            method: "DELETE",
        });
        await loadSheets();
    };


    return (
        <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <section className="max-w-6xl mx-auto px-6 py-16 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <Logo/>
                        <h1 className="text-4xl md:text-5xl font-bold">Your Sheets</h1>
                        <p className="text-slate-300 mt-2 max-w-xl">
                            Organize budgets, expenses, investments, and custom finance trackers.
                        </p>
                    </div>
                </div>

                {/* Create Sheet */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4">Create New Sheet</h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Sheet name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                        />

                        <Button
                            onClick={createSheet}
                            className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold"
                        >
                            Create
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">All Sheets</h2>
                        <span className="text-sm text-slate-400">
                        {sheets.length} total
                    </span>
                    </div>

                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-slate-400">ID</TableHead>
                                <TableHead className="text-slate-400">Name</TableHead>
                                <TableHead className="text-slate-400 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sheets.map((sheet) => (
                                <TableRow
                                    key={sheet.id}
                                    className="border-white/10 hover:bg-white/5 transition"
                                >
                                    {editingId === sheet.id ? (
                                        <>
                                            <TableCell>{sheet.id}</TableCell>

                                            <TableCell>
                                                <Input
                                                    value={editName}
                                                    onChange={(e) =>
                                                        setEditName(e.target.value)
                                                    }
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            saveEdit(sheet.id)
                                                        }
                                                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400"
                                                    >
                                                        Save
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                        className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="text-slate-400">
                                                {sheet.id}
                                            </TableCell>

                                            <TableCell
                                                onClick={() =>
                                                    router.push(
                                                        `/sheet/${sheet.id}`
                                                    )
                                                }
                                                className="cursor-pointer font-medium hover:text-emerald-400 transition"
                                            >
                                                {sheet.name}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            startEdit(sheet)
                                                        }
                                                        className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        onClick={() =>
                                                            deleteSheet(sheet.id)
                                                        }
                                                        className="rounded-xl"
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
            </section>
        </main>
    );
}