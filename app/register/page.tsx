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
        <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center px-4 sm:px-6">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-2xl">
                {/* Header */}
                <div className="mb-6 sm:mb-8 text-center">
                    <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                        $€
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Create Account
                    </h1>

                    <p className="text-slate-300 mt-2 text-sm sm:text-base">
                        Start managing your budget in minutes.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-3 sm:space-y-4">
                    <input
                        className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm sm:text-base outline-none focus:border-emerald-400"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />

                    <input
                        type="password"
                        className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm sm:text-base outline-none focus:border-emerald-400"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />

                    <button
                        onClick={handleRegister}
                        className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition py-3 text-sm sm:text-base font-semibold active:scale-[0.98]"
                    >
                        Register
                    </button>

                    <button
                        onClick={() => router.push('/login')}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition py-3 text-sm sm:text-base font-semibold active:scale-[0.98]"
                    >
                        Do you have an account? Log in
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <p className="mt-4 sm:mt-5 text-center text-xs sm:text-sm text-amber-300">
                        {message}
                    </p>
                )}
            </div>
        </main>
    );
}