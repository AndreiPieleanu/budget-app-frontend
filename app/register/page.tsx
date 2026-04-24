"use client";

import { useState } from "react";
import {useRouter} from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleRegister = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const text = await res.text();
        setMessage(text);
    };

    return (
        <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white grid place-items-center px-6">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center text-2xl font-bold mb-4">
                        $€
                    </div>
                    <h1 className="text-3xl font-bold">Create Account</h1>
                    <p className="text-slate-300 mt-2">Start managing your budget in minutes.</p>
                </div>

                <div className="space-y-4">
                    <input
                        className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-emerald-400"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-emerald-400"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        onClick={handleRegister}
                        className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition py-3 font-semibold"
                    >
                        Register
                    </button>

                    <button
                        onClick={() => router.push('/login')}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition py-3 font-semibold"
                    >
                        Do you have an account? Log in
                    </button>
                </div>

                {message && (
                    <p className="mt-5 text-center text-sm text-amber-300">{message}</p>
                )}
            </div>
        </main>
    );
}