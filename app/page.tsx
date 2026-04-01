"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8080";

type Sheet = {
  id: number;
  name: string;
};

type Source = {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: string;
};

export default function Home() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [name, setName] = useState("");

  // load sheets
  useEffect(() => {
    fetch(`${API}/sheets`)
        .then(res => res.json())
        .then(setSheets);
  }, []);

  // load sources when sheet selected
  const loadSources = (sheet: Sheet) => {
    setSelectedSheet(sheet);

    fetch(`${API}/sources/sheet/${sheet.id}`)
        .then(res => res.json())
        .then(setSources);
  };

  // create sheet
  const createSheet = async () => {
    if (!name) return;

    const res = await fetch(`${API}/sheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const newSheet = await res.json();
    setSheets(prev => [...prev, newSheet]);
    setName("");
  };

  return (
      <div style={{ padding: 20 }}>
        <h1>Sheets</h1>

        {/* Create sheet */}
        <div style={{ marginBottom: 20 }}>
          <input
              placeholder="Sheet name"
              value={name}
              onChange={e => setName(e.target.value)}
          />
          <button onClick={createSheet}>Create</button>
        </div>

        {/* Sheets list */}
        <ul>
          {sheets.map(sheet => (
              <li key={sheet.id}>
                <button onClick={() => loadSources(sheet)}>
                  {sheet.name}
                </button>
              </li>
          ))}
        </ul>

        {/* Selected sheet */}
        {selectedSheet && (
            <div style={{ marginTop: 30 }}>
              <h2>{selectedSheet.name}</h2>

              <table border={1} cellPadding={8}>
                <thead>
                <tr>
                  <th>Description</th>
                  <th>Income</th>
                  <th>Expense</th>
                </tr>
                </thead>
                <tbody>
                {sources.map(src => (
                    <tr key={src.id}>
                      <td>{src.description}</td>
                      <td>
                        {src.type === "INCOME" ? src.amount : ""}
                      </td>
                      <td>
                        {src.type === "EXPENSE" ? src.amount : ""}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
}