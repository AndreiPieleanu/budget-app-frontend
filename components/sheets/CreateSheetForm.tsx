"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateSheetFormProps {
    onCreate: (name: string) => Promise<void>;
    isLoading: boolean;
}

export default function CreateSheetForm({ onCreate, isLoading }: CreateSheetFormProps) {
    const [name, setName] = useState("");

    const handleCreate = async () => {
        if (!name) return;
        await onCreate(name);
        setName("");
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Create New Sheet
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
                <Input
                    placeholder="Sheet name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 text-sm sm:text-base"
                />
                <Button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="w-full lg:w-auto rounded-2xl text-black bg-emerald-500 hover:bg-emerald-400 font-semibold active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create"
                    )}
                </Button>
            </div>
        </div>
    );
}
