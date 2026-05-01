"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";

export default function Header() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const updateToken = () => {
            setToken(localStorage.getItem("token"));
        };

        updateToken();

        window.addEventListener("authChanged", updateToken);
        return () => window.removeEventListener("authChanged", updateToken);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        router.push("/login");
    };

    return (
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
            <Logo/>

            {/* Action */}
            {token ? (
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition text-sm sm:text-base active:scale-[0.98]"
                >
                    Logout
                </button>
            ) : (
                <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition text-sm sm:text-base active:scale-[0.98]"
                >
                    Login
                </button>
            )}
        </header>
    );
}