"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        router.push("/login");
    };

    return (
        <header className="flex justify-end p-4">
            {token ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <button onClick={() => router.push("/login")}>Login</button>
            )}
        </header>
    );
}