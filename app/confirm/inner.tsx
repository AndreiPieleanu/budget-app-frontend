"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ConfirmPageInner() {
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Confirming...");

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) return;

        fetch(`${API}/auth/confirm?token=${token}`)
            .then(res => res.text())
            .then(data => setMessage(`${data}. You can close this window now.`))
            .catch(() => setMessage("Error confirming account"));
    }, [token]);

    return <h2>{message}</h2>;
}