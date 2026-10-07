"use client";

import React from "react";

interface LogsEvent {
    id: number;
    message: string;
    createdAt: string;
    email: string;
}

interface ActivityLogsProps {
    logs: LogsEvent[];
    isLoading: boolean;
}

export default function ActivityLogs({ logs, isLoading }: ActivityLogsProps) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-3 text-slate-300">
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading activity...
            </div>
        );
    }

    if (logs.length === 0) {
        return <p className="text-slate-400">No activity yet.</p>;
    }

    return (
        <div className="space-y-3 max-h-125 overflow-y-auto">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-emerald-400">
                            {log.email}
                        </span>
                        <span className="text-xs text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                        {log.message}
                    </p>
                </div>
            ))}
        </div>
    );
}
