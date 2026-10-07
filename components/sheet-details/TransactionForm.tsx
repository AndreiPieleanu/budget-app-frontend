"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface TransactionFormProps {
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
}

export default function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
    const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("HUF");
    const [possibleStartDate, setPossibleStartDate] = useState("");
    const [possibleEndDate, setPossibleEndDate] = useState("");

    const handleAdd = async () => {
        if (!description || !amount) {
            return;
        }
        await onSubmit({
            type,
            description,
            amount: Number(amount),
            currency,
            possibleStartDate,
            possibleEndDate
        });
        // Reset form
        setDescription("");
        setAmount("");
        setPossibleStartDate("");
        setPossibleEndDate("");
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-5">
                Add Transaction
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <Select
                        value={type}
                        onValueChange={(v: any) => setType(v)}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    />

                    <Input
                        type="number"
                        placeholder="Estimated amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={0}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    />

                    <Select
                        value={currency}
                        onValueChange={(v: any) => setCurrency(v)}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                            Estimated receive/spend start date
                        </label>
                        <Input
                            type="date"
                            value={possibleStartDate}
                            onChange={(e) => setPossibleStartDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                            Estimated receive/spend end date
                        </label>
                        <Input
                            type="date"
                            value={possibleEndDate}
                            onChange={(e) => setPossibleEndDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleAdd}
                        disabled={isLoading}
                        className="w-full sm:w-auto rounded-2xl text-black bg-emerald-500 hover:bg-emerald-400 font-semibold active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Adding...
                            </>
                        ) : (
                            "Add Transaction"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
