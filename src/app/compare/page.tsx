"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import type { Contract } from "@/lib/types";
import { GitCompare, ArrowRight, Plus, Minus, Edit3, Sparkles, Loader2 } from "lucide-react";
import { severityColor } from "@/lib/utils";

type DiffChange = { section: string; change: "added" | "removed" | "modified"; description: string; impact: "high" | "medium" | "low" };
type DiffResult = { summary: string; changes: DiffChange[] };

export default function ComparePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/contracts").then(r => r.json()).then(d => setContracts(d.contracts || []));
  }, []);

  async function runCompare() {
    if (!a || !b) return;
    setLoading(true);
    setDiff(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aId: a, bId: b }),
      });
      const result = await res.json();
      setDiff(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <header className="border-b border-border bg-bg/40 backdrop-blur-sm sticky top-0 z-10 px-8 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-indigo-400" /> Compare Contract Versions
          </h1>
          <p className="text-sm text-gray-400">AI-powered redlining — see every material change between two versions</p>
        </header>

        <div className="p-8 fade-in max-w-5xl">
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Original / Base</label>
                <select value={a} onChange={e => setA(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="">Select a contract...</option>
                  {contracts.map(c => <option key={c.id} value={c.id} disabled={c.id === b}>{c.title}</option>)}
                </select>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 mb-3" />
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">New / Revised</label>
                <select value={b} onChange={e => setB(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="">Select a contract...</option>
                  {contracts.map(c => <option key={c.id} value={c.id} disabled={c.id === a}>{c.title}</option>)}
                </select>
              </div>
              <button
                onClick={runCompare}
                disabled={!a || !b || loading}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition flex items-center gap-2 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Analyzing..." : "Compare"}
              </button>
            </div>
          </div>

          {!diff && !loading && (
            <div className="glass rounded-xl p-16 text-center text-gray-500">
              <GitCompare className="w-12 h-12 mx-auto mb-3 text-gray-700" />
              Select two contracts to see AI-detected changes.
            </div>
          )}

          {loading && (
            <div className="glass rounded-xl p-12 text-center">
              <Loader2 className="w-10 h-10 text-indigo-400 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-gray-400">Comparing clauses side by side...</p>
            </div>
          )}

          {diff && (
            <div className="space-y-6 fade-in">
              <div className="glass rounded-xl p-6 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> AI Analysis Summary
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{diff.summary}</p>
              </div>

              <div className="glass rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-white">Detected Changes ({diff.changes.length})</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Plus className="w-3 h-3 text-green-400" /> Added</span>
                    <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-red-400" /> Removed</span>
                    <span className="flex items-center gap-1"><Edit3 className="w-3 h-3 text-yellow-400" /> Modified</span>
                  </div>
                </div>
                <div className="divide-y divide-border/50">
                  {diff.changes.map((ch, i) => {
                    const Icon = ch.change === "added" ? Plus : ch.change === "removed" ? Minus : Edit3;
                    const iconColor = ch.change === "added" ? "text-green-400 bg-green-500/10" : ch.change === "removed" ? "text-red-400 bg-red-500/10" : "text-yellow-400 bg-yellow-500/10";
                    return (
                      <div key={i} className="p-4 flex gap-3 hover:bg-white/2.5 transition">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs text-indigo-400 font-medium">{ch.section}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase ${severityColor(ch.impact)}`}>
                              {ch.impact} impact
                            </span>
                            <span className="text-[10px] text-gray-500 capitalize">{ch.change}</span>
                          </div>
                          <p className="text-sm text-gray-200">{ch.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
