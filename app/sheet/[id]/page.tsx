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

    const loadSources = useCallback(() => {
        authFetch(`sources/sheet/${id}`)
            .then(res => res.json())
            .then(setSources);
    }, [id]);

    useEffect(() => {
        loadSources();
    }, [id]);

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
                    rx={4}
                />

                <text
                    x={x + width + 8}
                    y={y + height / 2}
                    fontSize={12}
                    dominantBaseline="middle"
                    fill="#111"
                >
                    {payload.name} {payload.value}
                </text>
            </g>
        );
    };
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;

        const d = payload[0].payload;

        return (
            <div className="bg-white p-2 border rounded shadow">
                <p>{d.name}</p>
                <p>Value: {d.value}</p>
            </div>
        );
    };
    const Graph = ({sources}: { sources: Source[] }) => {
        const data = buildSankeyData(sources);

        return (
            <div className="overflow-x-auto">
                <div style={{ width: 1100 }}>
                    <Sankey
                        width={800}
                        height={400}
                        data={data}
                        node={<CustomNode />}
                        nodePadding={40}
                        margin={{ left: 50, right: 150, top: 20, bottom: 20 }}
                    >
                        <Tooltip content={<CustomTooltip/>}/>
                    </Sankey>
                </div>
            </div>
        );
    };

    return (
        <div className="w-225 mx-auto p-8 space-y-6">
            <h1 className="text-2xl font-bold">Sheet #{id}</h1>

            {/* Add source */}
            <div className="flex gap-2">
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="w-37.5">
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
                />

                <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={0}
                />

                <Button onClick={createSource}>Add</Button>
            </div>

            {/* Table */}
            <Button onClick={() => setShowGraph(true)}>
                Generate Graph
            </Button>
            <Table className="table-fixed w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Description</TableHead>
                        <TableHead className="w-[20%]">Income</TableHead>
                        <TableHead className="w-[20%]">Expense</TableHead>
                        <TableHead className="w-[20%]">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sources.map(src => (
                        <TableRow key={src.id}>
                            {editingId === src.id ? (
                                <>
                                    <TableCell>
                                        <Input
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                        />
                                    </TableCell>

                                    <TableCell colSpan={2}>
                                        <div className="flex gap-2">
                                            <Select
                                                value={editType}
                                                onValueChange={(v: any) => setEditType(v)}
                                            >
                                                <SelectTrigger className="w-30">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="INCOME">Income</SelectItem>
                                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                min={0}
                                            />
                                        </div>
                                    </TableCell>

                                    <TableCell className="flex gap-2">
                                        <Button onClick={() => saveEdit(src.id)}>Save</Button>
                                        <Button variant="outline" onClick={() => setEditingId(null)}>
                                            Cancel
                                        </Button>
                                    </TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell>{src.description}</TableCell>

                                    <TableCell>
                                        {src.type === "INCOME" ? src.amount : ""}
                                    </TableCell>

                                    <TableCell>
                                        {src.type === "EXPENSE" ? src.amount : ""}
                                    </TableCell>

                                    <TableCell className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => startEdit(src)}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            onClick={() => deleteSource(src.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div>
                {showGraph && <Graph sources={sources}/>}
            </div>
        </div>
    );
}