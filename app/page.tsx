"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {authFetch} from "@/app/helpers/helpers";
import {useSnackbar} from "notistack";

type Sheet = {
    id: number;
    name: string;
};

export default function Home() {
    const [sheets, setSheets] = useState<Sheet[]>([]);
    const [name, setName] = useState("");
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const loadSheets = () =>{
        authFetch(`sheets`)
            .then(res => res.json())
            .then(setSheets);
    };
    useEffect(() => {
        const loadPage = async () => {
            try {
                const res = await authFetch(`sheets`);
                const data = await res.json();

                setSheets(data);
            } catch (error: any) {
                enqueueSnackbar(error.message, {
                    variant: "error",
                });
            }
        };

        loadPage();
    }, []);

    const createSheet = async () => {
        if (!name) return;

        const res = await authFetch(`sheets`, {
            method: "POST",
            body: {name},
        });

        const newSheet = await res.json();
        setSheets(prev => [...prev, newSheet]);
        setName("");
    };
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const startEdit = (sheet: Sheet) => {
        setEditingId(sheet.id);
        setEditName(sheet.name);
    };
    const saveEdit = async (sourceId: number) => {
        await authFetch(`sheets/${sourceId}`, {
            method: "PUT",
            body: {name: editName},
        });

        setEditingId(null);
        loadSheets();
    };

    const deleteSheet = async (sheetId: number) => {
        await authFetch(`sheets/${sheetId}`, {
            method: "DELETE",
        });
        loadSheets();
    };


    return (
        <div className="w-225 mx-auto p-8 space-y-6">
            <h1 className="text-3xl font-bold">Sheets</h1>

            <div className="flex gap-2">
                <Input
                    placeholder="Sheet name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Button onClick={createSheet}>Create</Button>
            </div>

            <div className="space-y-2">
                <Table className="table-fixed w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[10%]">ID</TableHead>
                            <TableHead className="w-[70%]">Name</TableHead>
                            <TableHead className="w-[20%]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sheets.map(sheet => (
                            <TableRow key={sheet.id}>
                                {editingId === sheet.id ? (
                                    <>
                                        <TableCell>{sheet.id}</TableCell>

                                        <TableCell>
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        </TableCell>

                                        <TableCell className="flex gap-2">
                                            <Button onClick={() => saveEdit(sheet.id)}>Save</Button>
                                            <Button variant="outline" onClick={() => setEditingId(null)}>
                                                Cancel
                                            </Button>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{sheet.id}</TableCell>
                                        <TableCell onClick={() => router.push(`/sheet/${sheet.id}`)}>{sheet.name}</TableCell>
                                        <TableCell>
                                            <div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => startEdit(sheet)}>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => deleteSheet(sheet.id)}>
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
            </div>
        </div>
    );
}