"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurrencyControlsProps {
    currencyTo: string;
    setCurrencyTo: (val: any) => void;
    onGenerateGraph: () => Promise<void>;
    onGenerateTimeline: () => Promise<void>;
    onShowLogs: () => void;
}

export default function CurrencyControls({
    currencyTo,
    setCurrencyTo,
    onGenerateGraph,
    onGenerateTimeline,
    onShowLogs,
}: CurrencyControlsProps) {
    return (
        <div className="flex justify-end gap-2">
            <span className="mr-2">Select currency to convert to:</span>
            <Select
                value={currencyTo}
                onValueChange={(v: any) => setCurrencyTo(v)}
            >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="EUR">Euros</SelectItem>
                    <SelectItem value="RON">Romanian rons</SelectItem>
                    <SelectItem value="HUF">Hungarian forints</SelectItem>
                    <SelectItem value="ZAR">South African rands</SelectItem>
                    <SelectItem value="USD">US dollars</SelectItem>
                </SelectContent>
            </Select>

            <Button
                onClick={onGenerateGraph}
                className="w-full sm:w-auto rounded-2xl bg-sky-500 hover:bg-sky-400 font-semibold text-black"
            >
                Generate Graph
            </Button>

            <Button
                onClick={onGenerateTimeline}
                className="w-full sm:w-auto rounded-2xl bg-sky-500 hover:bg-sky-400 font-semibold text-black"
            >
                Generate timeline
            </Button>

            <Button
                onClick={onShowLogs}
                className="w-full sm:w-auto rounded-2xl bg-sky-500 hover:bg-sky-400 font-semibold text-black"
            >
                Show logs
            </Button>
        </div>
    );
}
