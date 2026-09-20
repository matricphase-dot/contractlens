"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import type { Contract } from "@/lib/types";
import { FileText, AlertTriangle, Calendar, Trash2, Search } from "lucide-react";
import { formatDate, severityColor } from "@/lib/utils";

export default function ContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/contracts");
    const data = await res.json();
    setContracts(data.contracts || []);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this contract?")) return;
    await fetch(`/api/contracts?id=${id}`, { method: "DELETE" });
    load();
  }

  const filtered = contracts.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.contractType.toLowerCase().includes(search.toLowerCase()) ||
    c.parties.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <header className="border-b border-border bg-bg/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">All Contracts</h1>
              <p className="text-sm text-gray-400">{contracts.length} contracts in your portfolio</p>
            </div>
            <Link href="/app/upload" className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition">+ Upload</Link>
          </div>
        </header>

        <div className="p-8 fade-in">
          <div className="mb-6 relative max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contracts, parties, types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass rounded-lg p-5 h-24 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No contracts found.</div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left p-4 font-medium">Contract</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Parties</th>
                    <th className="text-left p-4 font-medium">Expires</th>
                    <th className="text-left p-4 font-medium">Risks</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const highRisks = c.riskClauses.filter(r => r.severity === "high" || r.severity === "critical").length;
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-white/2.5 transition group">
                        <td className="p-4">
                          <Link href={`/app/contract/${c.id}`} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm group-hover:text-indigo-300 transition">{c.title}</div>
                              <div className="text-xs text-gray-500">{c.obligations.length} obligations · {c.keyDates.length} key dates</div>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 text-sm text-gray-300">{c.contractType}</td>
                        <td className="p-4 text-sm text-gray-400">
                          <div className="max-w-[200px] truncate">{c.parties.map(p => p.name).join(" · ")}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-400">{c.expirationDate ? formatDate(c.expirationDate) : "—"}</td>
                        <td className="p-4">
                          {highRisks > 0 ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${severityColor("high")}`}>
                              <AlertTriangle className="w-3 h-3" /> {highRisks} high
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Clean</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Analyzed
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => remove(c.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
