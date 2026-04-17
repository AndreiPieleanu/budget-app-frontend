"use client";

import { useEffect, useState } from "react";
import SheetPage from "@/app/sheet/page";

export default function Home() {

    const [ready, setReady] = useState(false);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const checkToken = () => {
            setHasToken(!!token);
            setReady(true);
        }
        checkToken();
    }, []);

    if (!ready) {
        return (
            <main className="min-h-screen grid place-items-center text-sm text-slate-500">
                Loading...
            </main>
        );
    }

    if (hasToken) return <SheetPage />;

    return (
        <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <section className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-2 bg-white/5">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 grid place-items-center font-bold text-emerald-400">
                                $€
                            </div>
                            <span className="font-semibold tracking-wide">EuroWise</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Control your money with clarity.
                        </h1>

                        <p className="text-slate-300 text-lg max-w-xl">
                            Track income, expenses, and organize your finances with smart sheets built for speed and simplicity.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <a href="/login" className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition font-semibold">
                                Login
                            </a>
                            <a href="/register" className="px-6 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition font-semibold">
                                Create Account
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl">
                            <div className="flex justify-between text-sm text-slate-300 mb-4">
                                <span>Monthly Overview</span>
                                <span>April</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 items-center text-sm">
                                <div className="space-y-3">
                                    <FlowBox label="Salary" value="€3,500" />
                                    <FlowBox label="Freelance" value="€700" />
                                </div>

                                <div className="relative flex justify-center">
                                    <div className="absolute left-0 top-1/3 h-0.5 w-10 bg-emerald-400/60" />
                                    <div className="absolute left-0 bottom-1/3 h-0.5 w-10 bg-emerald-400/60" />
                                    <div className="absolute right-0 top-1/3 h-0.5 w-10 bg-sky-400/60" />
                                    <div className="absolute right-0 bottom-1/3 h-0.5 w-10 bg-amber-400/60" />

                                    <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/20 px-5 py-6 text-center min-w-[120px]">
                                        <div className="text-slate-300 text-xs">Total</div>
                                        <div className="font-bold text-xl text-emerald-400">€4,200</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <FlowBox label="Expenses" value="€2,180" tone="blue" />
                                    <FlowBox label="Saved" value="€2,020" tone="gold" />
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Card title="Fast Sheets" text="Separate budgets for rent, travel, investing and more." />
                            <Card title="Secure Access" text="Simple token login with protected routes." />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}


function FlowBox({ label, value, tone = "green" }: { label: string; value: string; tone?: "green" | "blue" | "gold" }) {
    const styles = {
        green: "bg-emerald-500/10 border-emerald-400/20 text-emerald-300",
        blue: "bg-sky-500/10 border-sky-400/20 text-sky-300",
        gold: "bg-amber-500/10 border-amber-400/20 text-amber-300",
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 ${styles[tone]}`}>
            <div className="text-xs opacity-80">{label}</div>
            <div className="font-semibold">{value}</div>
        </div>
    );
}

function Card({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-slate-300">{text}</p>
        </div>
    );
}

function StatRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
            <span className="text-slate-300">{label}</span>
            <span className={positive ? "font-semibold text-emerald-400" : "font-semibold"}>{value}</span>
        </div>
    );
}