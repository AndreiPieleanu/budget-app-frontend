"use client";

import { useState } from "react";
import {useRouter} from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleRegister = async () => {
        const res = await fetch("http://localhost:8080/auth/register", {
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
        <div style={{ padding: "2rem" }}>
            <h2>Register</h2>

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

            <button onClick={handleRegister}>Register</button>
            <br/>
            <button onClick={() => router.push("/login")}>Do you have an account? Log in</button>

            <p>{message}</p>
        </div>
    );
}