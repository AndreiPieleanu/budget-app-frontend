"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface Sheet {
    id: number;
    name: string;
}

interface SheetTableProps {
    sheets: Sheet[];
    editingId: number | null;
    editName: string;
    setEditName: (name: string) => void;
    setEditingId: (id: number | null) => void;
    onSaveEdit: (id: number, name: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onStartEdit: (sheet: Sheet) => void;
}

export default function SheetTable({
    sheets,
    editingId,
    editName,
    setEditName,
    setEditingId,
    onSaveEdit,
    onDelete,
    onStartEdit,
}: SheetTableProps) {
    return (
        <Table className="w-full">
            <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-400">ID</TableHead>
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400 text-right">
                        Actions
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {sheets.map((sheet) => (
                    <TableRow
                        key={sheet.id}
                        className="border-white/10 hover:bg-white/5 transition"
                    >
                        {editingId === sheet.id ? (
                            <>
                                <TableCell>{sheet.id}</TableCell>

                                <TableCell>
                                    <Input
                                        value={editName}
                                        onChange={(e) =>
                                            setEditName(e.target.value)
                                        }
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </TableCell>

                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            onClick={() =>
                                                onSaveEdit(sheet.id, editName)
                                            }
                                            className="bg-emerald-500 hover:bg-emerald-400"
                                        >
                                            Save
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setEditingId(null)
                                            }
                                            className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </TableCell>
                            </>
                        ) : (
                            <>
                                <TableCell className="text-slate-400">
                                    {sheet.id}
                                </TableCell>

                                <TableCell
                                    onClick={() =>
                                        window.location.href = `/sheet/${sheet.id}`
                                    }
                                    className="cursor-pointer font-medium hover:text-emerald-400 transition"
                                >
                                    {sheet.name}
                                </TableCell>

                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                onStartEdit(sheet)
                                            }
                                            className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                onDelete(sheet.id)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
