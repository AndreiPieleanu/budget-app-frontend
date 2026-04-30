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
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                <div className="grid md:grid-cols-2 gap-10 items-center">

                    {/* LEFT */}
                    <div className="space-y-5 sm:space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-2 bg-white/5 mx-auto md:mx-0">
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/20 grid place-items-center font-bold text-emerald-400">
                                $€
                            </div>
                            <span className="font-semibold tracking-wide">
                                EuroWise
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
                            Control your money with clarity.
                        </h1>

                        <p className="text-slate-300 text-sm sm:text-lg max-w-xl mx-auto md:mx-0">
                            Track income, expenses, and organize your finances with smart sheets built for speed and simplicity.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center md:justify-start">
                            <a href="/login" className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition font-semibold active:scale-[0.98]">
                                Login
                            </a>

                            <a href="/register" className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition font-semibold active:scale-[0.98]">
                                Create Account
                            </a>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="grid gap-4">

                        {/* FLOW CARD */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-4 sm:p-6 shadow-2xl">
                            <div className="flex justify-between text-xs sm:text-sm text-slate-300 mb-4">
                                <span>Monthly Overview</span>
                                <span>April</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 sm:gap-4 items-center text-xs sm:text-sm">

                                <div className="space-y-2 sm:space-y-3">
                                    <FlowBox label="Salary" value="€3,500" />
                                    <FlowBox label="Freelance" value="€700" />
                                </div>

                                <div className="relative flex justify-center">
                                    <div className="absolute left-0 top-1/3 h-0.5 w-6 sm:w-10 bg-emerald-400/60" />
                                    <div className="absolute left-0 bottom-1/3 h-0.5 w-6 sm:w-10 bg-emerald-400/60" />
                                    <div className="absolute right-0 top-1/3 h-0.5 w-6 sm:w-10 bg-sky-400/60" />
                                    <div className="absolute right-0 bottom-1/3 h-0.5 w-6 sm:w-10 bg-amber-400/60" />

                                    <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/20 px-3 sm:px-5 py-4 sm:py-6 text-center min-w-[90px] sm:min-w-[120px]">
                                        <div className="text-slate-300 text-[10px] sm:text-xs">
                                            Total
                                        </div>
                                        <div className="font-bold text-base sm:text-xl text-emerald-400">
                                            €4,200
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 sm:space-y-3">
                                    <FlowBox label="Expenses" value="€2,180" tone="blue" />
                                    <FlowBox label="Saved" value="€2,020" tone="gold" />
                                </div>
                            </div>
                        </div>

                        {/* CARDS */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Card
                                title="Fast Sheets"
                                text="Separate budgets for rent, travel, investing and more."
                            />
                            <Card
                                title="Secure Access"
                                text="Simple token login with protected routes."
                            />
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