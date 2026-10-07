"use client";

import React from "react";
import { Sankey, Tooltip } from "recharts";

interface Source {
    id: number;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    currency: "EUR" | "RON" | "HUF" | "ZAR" | "USD";
    actualAmount: number;
    possibleStartDate: string;
    possibleEndDate: string;
}

interface MoneyFlowGraphProps {
    sources: Source[];
}

const getValue = (source: Source) =>
    source.actualAmount != null && source.actualAmount !== 0
        ? source.actualAmount
        : source.amount;

function buildSankeyData(sources: Source[]) {
    const incomes = sources.filter(s => s.type === "INCOME");
    const expenses = sources.filter(s => s.type === "EXPENSE");

    const nodes: any[] = [];
    const links: any[] = [];

    incomes.forEach((inc) => {
        nodes.push({
            name: `${inc.description}`,
            color: "#16a34a",
        });
    });

    const totalIncome = incomes.reduce((sum, income) => sum + getValue(income), 0);
    const totalIndex = nodes.length;
    nodes.push({
        name: `Total`,
        color: "#2563eb",
    });

    incomes.forEach((inc, i) => {
        links.push({
            source: i,
            target: totalIndex,
            value: getValue(inc),
        });
    });

    let totalExpense = 0;
    expenses.forEach((exp) => {
        const idx = nodes.length;
        const value = getValue(exp);

        nodes.push({
            name: `${exp.description}`,
            color: "#dc2626",
        });

        links.push({
            source: totalIndex,
            target: idx,
            value: value,
        });

        totalExpense += value;
    });

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
}

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
                {payload.name}
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

export default function MoneyFlowGraph({ sources }: MoneyFlowGraphProps) {
    const data = buildSankeyData(sources);
    const totalIncome = sources
        .filter((s) => s.type === "INCOME")
        .reduce((sum, s) => sum + Number(getValue(s)), 0);

    const totalExpense = sources
        .filter((s) => s.type === "EXPENSE")
        .reduce((sum, s) => sum + Number(getValue(s)), 0);

    const balance = Number((totalIncome - totalExpense).toFixed(2));

    const nodeCount = data.nodes.length;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const width = isMobile
        ? Math.max(600, nodeCount * 70)
        : Math.max(900, nodeCount * 90);

    const height = isMobile ? 420 : 520;

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">
            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Money Flow Overview
                </h2>
                <p className="text-slate-300 mt-1 sm:mt-2 text-sm sm:text-base">
                    Visualize how income moves into expenses and savings.
                </p>
            </div>

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

            {balance < 0 && (
                <div className="mt-4 sm:mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 sm:px-4 py-2 sm:py-3">
                    <p className="text-amber-300 font-medium text-sm sm:text-base">
                        You spent {Math.abs(balance).toFixed(2)} more than you earned.
                    </p>
                </div>
            )}
        </div>
    );
}
