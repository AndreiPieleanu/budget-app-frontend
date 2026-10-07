"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Sheet {
    id: number;
    name: string;
}

interface SheetMobileListProps {
    sheets: Sheet[];
    editingId: number | null;
    editName: string;
    setEditName: (name: string) => void;
    setEditingId: (id: number | null) => void;
    onSaveEdit: (id: number, name: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onStartEdit: (sheet: Sheet) => void;
}

export default function SheetMobileList({
    sheets,
    editingId,
    editName,
    setEditName,
    setEditingId,
    onSaveEdit,
    onDelete,
    onStartEdit,
}: SheetMobileListProps) {
    return (
        <div className="space-y-3">
            {sheets.map((sheet) => (
                <div
                    key={sheet.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                    {editingId === sheet.id ? (
                        <>
                            <Input
                                value={editName}
                                onChange={(e) =>
                                    setEditName(e.target.value)
                                }
                                className="mb-3 bg-white/5 border-white/10 text-white"
                            />

                            <div className="flex gap-2">
                                <Button
                                    onClick={() =>
                                        onSaveEdit(sheet.id, editName)
                                    }
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400"
                                >
                                    Save
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setEditingId(null)
                                    }
                                    className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                onClick={() =>
                                    window.location.href = `/sheet/${sheet.id}`
                                }
                                className="font-semibold text-base mb-3 cursor-pointer hover:text-emerald-400"
                            >
                                {sheet.name}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        onStartEdit(sheet)
                                    }
                                    className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        onDelete(sheet.id)
                                    }
                                    className="flex-1"
                                >
                                    Delete
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
