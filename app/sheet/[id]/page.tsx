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
import {useSnackbar} from "notistack";

type Source = {
    id: number;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
};

export default function SheetPage() {
    const { id } = useParams();

    const [sources, setSources] = useState<Source[]>([]);
    const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const [showGraph, setShowGraph] = useState(false);

    const [sheetName, setSheetName] = useState("");
    const { enqueueSnackbar } = useSnackbar();

    const loadSources = useCallback(() => {
        authFetch(`sources/sheet/${id}`)
            .then(res => res.json())
            .then(setSources);
    }, [id]);

    useEffect(() => {
        const loadPage = async () => {
            try {
                loadSources();

                const res = await authFetch(`sheets/${id}`);
                const data = await res.json();

                setSheetName(data.name);

            } catch (error: any) {
                enqueueSnackbar(error.message, {
                    variant: "error",
                });
            }
        };

        loadPage();
    }, [id, loadSources]);

    const createSource = async () => {
        await authFetch(`sources`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: {
                type,
                amount: Number(amount),
                description,
                sheetId: Number(id),
            },
        });

        setAmount("");
        setDescription("");
        loadSources();
    };

    const deleteSource = async (sourceId: number) => {
        await authFetch(`sources/${sourceId}`, {
            method: "DELETE",
        });
        loadSources();
    };

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editAmount, setEditAmount] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editType, setEditType] = useState<"INCOME" | "EXPENSE">("INCOME");

    const startEdit = (src: Source) => {
        setEditingId(src.id);
        setEditAmount(String(src.amount));
        setEditDescription(src.description);
        setEditType(src.type);
    };

    const saveEdit = async (sourceId: number) => {
        await authFetch(`sources/${sourceId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: {
                type: editType,
                amount: Number(editAmount),
                description: editDescription,
                sheetId: id,
            },
        });

        setEditingId(null);
        loadSources();
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
                    Amount: <span className="text-emerald-400 font-medium">€{d.value}</span>
                </p>
            </div>
        );
    };

    const Graph = ({ sources }: { sources: Source[] }) => {
        const data = buildSankeyData(sources);

        const nodeCount = data.nodes.length;
        const width = Math.max(900, nodeCount * 90);

        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Money Flow Overview
                    </h2>
                    <p className="text-slate-300 mt-2">
                        Visualize how income moves into expenses and savings.
                    </p>
                </div>

                {/* Graph */}
                <div className="overflow-x-auto rounded-2xl bg-slate-950/70 border border-white/5 p-4">
                    <div style={{ width }}>
                        <Sankey
                            width={width}
                            height={520}
                            data={data}
                            node={<CustomNode />}
                            nodePadding={14}
                            margin={{
                                left: 50,
                                right: 180,
                                top: 20,
                                bottom: 20,
                            }}
                            link={{ strokeOpacity: 0.35 }}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Sankey>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <section className="max-w-6xl mx-auto px-6 py-16 space-y-8">
                {/* Header */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-2 bg-white/5">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 grid place-items-center font-bold text-emerald-400">
                            $€
                        </div>
                        <span className="font-semibold tracking-wide">
                        EuroWise
                    </span>
                    </div>

                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            {sheetName}
                        </h1>
                        <p className="text-slate-300 mt-2">
                            Track income and expenses with clarity.
                        </p>
                    </div>
                </div>

                {/* Add Source */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4">
                        Add Transaction
                    </h2>

                    <div className="grid md:grid-cols-4 gap-3">
                        <Select
                            value={type}
                            onValueChange={(v: any) => setType(v)}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="INCOME">
                                    Income
                                </SelectItem>
                                <SelectItem value="EXPENSE">
                                    Expense
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Description"
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                        />

                        <Input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) =>
                                setAmount(e.target.value)
                            }
                            min={0}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                        />

                        <Button
                            onClick={createSource}
                            className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 font-semibold"
                        >
                            Add
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    <Button
                        onClick={() => setShowGraph(true)}
                        className="rounded-2xl bg-sky-500 hover:bg-sky-400 font-semibold"
                    >
                        Generate Graph
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl overflow-hidden">
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
                                                    value={
                                                        editDescription
                                                    }
                                                    onChange={(e) =>
                                                        setEditDescription(
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </TableCell>

                                            <TableCell colSpan={2}>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={
                                                            editType
                                                        }
                                                        onValueChange={(
                                                            v: any
                                                        ) =>
                                                            setEditType(
                                                                v
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            <SelectItem value="INCOME">
                                                                Income
                                                            </SelectItem>
                                                            <SelectItem value="EXPENSE">
                                                                Expense
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        type="number"
                                                        value={
                                                            editAmount
                                                        }
                                                        onChange={(e) =>
                                                            setEditAmount(
                                                                e.target
                                                                    .value
                                                            )
                                                        }
                                                        min={0}
                                                        className="bg-white/5 border-white/10 text-white"
                                                    />
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            saveEdit(
                                                                src.id
                                                            )
                                                        }
                                                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400"
                                                    >
                                                        Save
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditingId(
                                                                null
                                                            )
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
                                            <TableCell className="font-medium">
                                                {
                                                    src.description
                                                }
                                            </TableCell>

                                            <TableCell className="text-emerald-400 font-semibold">
                                                {src.type ===
                                                "INCOME"
                                                    ? `${src.amount}`
                                                    : ""}
                                            </TableCell>

                                            <TableCell className="text-rose-400 font-semibold">
                                                {src.type ===
                                                "EXPENSE"
                                                    ? `${src.amount}`
                                                    : ""}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            startEdit(
                                                                src
                                                            )
                                                        }
                                                        className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        onClick={() =>
                                                            deleteSource(
                                                                src.id
                                                            )
                                                        }
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
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold mb-4">
                            Overview Graph
                        </h2>
                        <Graph sources={sources} />
                    </div>
                )}
            </section>
        </main>
    );
}