"use client";

import { Suspense } from "react";
import ConfirmPageInner from "@/app/confirm/inner";

export default function ConfirmPage() {
    return (
        <Suspense fallback={<h2>Loading...</h2>}>
            <ConfirmPageInner />
        </Suspense>
    );
}