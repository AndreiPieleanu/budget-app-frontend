"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface Source {
    id: number;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    currency: "EUR" | "RON" | "HUF" | "ZAR" | "USD";
    actualAmount: number;
    possibleStartDate: string;
    possibleEndDate: string;
}

interface SourceListProps {
    sources: Source[];
    editingId: number | null;
    editValues: any;
    setEditValues: (updater: (prev: any) => any) => void;
    onStartEdit: (src: Source) => void;
    onSaveEdit: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    setEditingId: (id: number | null) => void;
}

export default function SourceList({
    sources,
    editingId,
    editValues,
    setEditValues,
    onStartEdit,
    onSaveEdit,
    onDelete,
    setEditingId,
}: SourceListProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* MOBILE VIEW */}
            <div className="space-y-3 sm:hidden">
                {sources.map((src) => (
                    <SourceMobileItem
                        key={src.id}
                        src={src}
                        isEditing={editingId === src.id}
                        editValues={editValues}
                        setEditValues={setEditValues}
                        onStartEdit={onStartEdit}
                        onSaveEdit={onSaveEdit}
                        onDelete={onDelete}
                        onCancel={() => setEditingId(null)}
                    />
                ))}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden sm:block">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-200">Description</TableHead>
                            <TableHead className="text-slate-200">Est. income</TableHead>
                            <TableHead className="text-slate-200">Est. expense</TableHead>
                            <TableHead className="text-slate-200">Currency</TableHead>
                            <TableHead className="text-slate-200">Actual amount</TableHead>
                            <TableHead className="text-slate-200">Estimated start date</TableHead>
                            <TableHead className="text-slate-200">Estimated end date</TableHead>
                            <TableHead className="text-slate-200">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sources.map((src) => (
                            <SourceTableRow
                                key={src.id}
                                src={src}
                                isEditing={editingId === src.id}
                                editValues={editValues}
                                setEditValues={setEditValues}
                                onStartEdit={onStartEdit}
                                onSaveEdit={onSaveEdit}
                                onDelete={onDelete}
                                onCancel={() => setEditingId(null)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function SourceMobileItem({
    src, isEditing, editValues, setEditValues, onStartEdit, onSaveEdit, onDelete, onCancel
}: any) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            {isEditing ? (
                <>
                    <Input
                        value={editValues.description}
                        onChange={(e) => setEditValues((prev: any) => ({ ...prev, description: e.target.value }))}
                        className="mb-3 bg-white/5 border-white/10 text-white"
                    />
                    <div className="flex gap-2 mb-3">
                        <Select
                            value={editValues.type}
                            onValueChange={(v: any) => setEditValues((prev: any) => ({ ...prev, type: v }))}
                        >
                            <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INCOME">Income</SelectItem>
                                <SelectItem value="EXPENSE">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            value={editValues.amount}
                            onChange={(e) => setEditValues((prev: any) => ({ ...prev, amount: e.target.value }))}
                            className="flex-1 bg-white/5 border-white/10 text-white"
                        />
                        <Select
                            value={editValues.currency}
                            onValueChange={(v: any) => setEditValues((prev: any) => ({ ...prev, currency: v }))}
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
                    <div className="flex gap-2">
                        <Button
                            onClick={() => onSaveEdit(src.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400"
                        >
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                        >
                            Cancel
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{src.description}</span>
                        <span className={`font-semibold ${src.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}>
                            {src.amount} {src.currency}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onStartEdit(src)}
                            className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => onDelete(src.id)}
                            className="flex-1"
                        >
                            Delete
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

function SourceTableRow({
    src, isEditing, editValues, setEditValues, onStartEdit, onSaveEdit, onDelete, onCancel
}: any) {
    return (
        <TableRow className="border-white/10 hover:bg-white/5 transition">
            {isEditing ? (
                <>
                    <TableCell>
                        <Input
                            value={editValues.description}
                            onChange={(e) => setEditValues((prev: any) => ({ ...prev, description: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </TableCell>
                    <TableCell colSpan={2}>
                        <div className="flex gap-2">
                            <Select
                                value={editValues.type}
                                onValueChange={(v: any) => setEditValues((prev: any) => ({ ...prev, type: v }))}
                            >
                                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Income</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                value={editValues.amount}
                                onChange={(e) => setEditValues((prev: any) => ({ ...prev, amount: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </TableCell>
                    <TableCell>
                        <Select
                            value={editValues.currency}
                            onValueChange={(v: any) => setEditValues((prev: any) => ({ ...prev, currency: v }))}
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
                    </TableCell>
                    <TableCell>
                        <Input type="number"
                            value={editValues.actualAmount}
                            onChange={(e) => setEditValues((prev: any) => ({ ...prev, actualAmount: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </TableCell>
                    <TableCell>
                        <Input
                            type="date"
                            value={editValues.possibleStartDate}
                            onChange={(e) => setEditValues((prev: any) => ({ ...prev, possibleStartDate: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </TableCell>
                    <TableCell>
                        <Input
                            type="date"
                            value={editValues.possibleEndDate}
                            onChange={(e) => setEditValues((prev: any) => ({ ...prev, possibleEndDate: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={() => onSaveEdit(src.id)}
                                className="bg-emerald-500 hover:bg-emerald-400"
                            >
                                Save
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                            >
                                Cancel
                            </Button>
                        </div>
                    </TableCell>
                </>
            ) : (
                <>
                    <TableCell className="font-medium">{src.description}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold">
                        {src.type === "INCOME" ? src.amount : ""}
                    </TableCell>
                    <TableCell className="text-rose-400 font-semibold">
                        {src.type === "EXPENSE" ? src.amount : ""}
                    </TableCell>
                    <TableCell className="font-semibold">{src.currency}</TableCell>
                    <TableCell>{src.actualAmount}</TableCell>
                    <TableCell>{src.possibleStartDate}</TableCell>
                    <TableCell>{src.possibleEndDate}</TableCell>
                    <TableCell>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onStartEdit(src)}
                                className="border-white/15 bg-white/5 hover:bg-white/10 text-white"
                            >
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => onDelete(src.id)}
                                className="flex-1"
                                >
                                Delete
                                </Button>
                        </div>
                    </TableCell>
                </>
            )}
        </TableRow>
    );
}
