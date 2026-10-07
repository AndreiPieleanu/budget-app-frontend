"use client";

import SheetTable from "./SheetTable";
import SheetMobileList from "./SheetMobileList";

interface Sheet {
    id: number;
    name: string;
}

interface SheetListProps {
    sheets: Sheet[];
    editingId: number | null;
    editName: string;
    setEditName: (name: string) => void;
    setEditingId: (id: number | null) => void;
    onSaveEdit: (id: number, name: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onStartEdit: (sheet: Sheet) => void;
}

export default function SheetList({
    sheets,
    editingId,
    editName,
    setEditName,
    setEditingId,
    onSaveEdit,
    onDelete,
    onStartEdit,
}: SheetListProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                    All Sheets
                </h2>
                <span className="text-xs sm:text-sm text-slate-400">
                    {sheets.length} total
                </span>
            </div>

            {/* MOBILE VIEW */}
            <div className="space-y-3 sm:hidden">
                <SheetMobileList
                    sheets={sheets}
                    editingId={editingId}
                    editName={editName}
                    setEditName={setEditName}
                    setEditingId={setEditingId}
                    onSaveEdit={onSaveEdit}
                    onDelete={onDelete}
                    onStartEdit={onStartEdit}
                />
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden sm:block">
                <SheetTable
                    sheets={sheets}
                    editingId={editingId}
                    editName={editName}
                    setEditName={setEditName}
                    setEditingId={setEditingId}
                    onSaveEdit={onSaveEdit}
                    onDelete={onDelete}
                    onStartEdit={onStartEdit}
                />
            </div>
        </div>
    );
}
