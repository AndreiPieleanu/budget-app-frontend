"use client";

import { useState } from "react";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        const res = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            setMessage("Login failed");
            return;
        }

        const data = await res.json();

        // ✅ store token
        localStorage.setItem("token", data.token);

        setMessage("Logged in");

        router.push("http://localhost:3000")
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Login</h2>

            <input
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />

            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            <button onClick={handleLogin}>Login</button>
            <br/>
            <button onClick={() => router.push("/register")}>New here? Register</button>

            <p>{message}</p>
        </div>
    );
}