"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API = "http://localhost:8080";

export default function ConfirmPage() {
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Confirming...");
    const token = searchParams.get("token");

    useEffect(() => {
        fetch(`${API}/auth/confirm?token=${token}`)
            .then(res => res.text())
            .then(data => setMessage(`${data}. You can close this window now.`))
            .catch(() => setMessage("Error confirming account"));
    }, [token]);

    return <h2>{message}</h2>;
}