"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, AlertTriangle, Clock, Upload, ChevronRight, ShieldCheck, Zap, Layers,
  CheckCircle2, Calendar, ArrowUpRight, TrendingUp, Activity, Bot, Brain,
  Search, Database, GitBranch, Bell, Plus
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import type { Contract } from "@/lib/types";
import { severityColor, daysUntil, formatDate } from "@/lib/utils";
import { detectCrossContractConflicts } from "@/lib/contract-utils";

export default function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    bootstrap();
  }, []);

  // Hydrate server state from localStorage (fixes Vercel stateless lambda persistence)
  // Then fetch. After fetch, save back to localStorage.
  async function bootstrap() {
    try {
      const saved = localStorage.getItem("contractlens:contracts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Push saved contracts to server so current lambda has them
          await fetch("/api/contracts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contracts: parsed }),
          }).catch(() => {});
        }
      }
    } catch (e) {}
    await load();
  }

  async function loadDemo() {
    setLoading(true);
    await fetch("/api/demo", { method: "POST" }).catch(() => {});
    await load();
  }

  async function load() {
    const res = await fetch("/api/contracts");
    const data = await res.json();
    const list = data.contracts || [];
    setContracts(list);
    setConflicts(detectCrossContractConflicts(list));
    setLoading(false);
    try { localStorage.setItem("contractlens:contracts", JSON.stringify(list)); } catch (e) {}
  }

  const upcomingObligations = contracts.flatMap(c =>
    c.keyDates
      .filter(kd => kd.date && new Date(kd.date).getTime() > Date.now() - 86400000 && !kd.dismissed)
      .map(kd => ({ ...kd, contract: c }))
  ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  const allRisks = contracts.flatMap(c => c.riskClauses.map(r => ({ ...r, contract: c })));
  const criticalRisks = allRisks.filter(r => r.severity === "critical" || r.severity === "high");
  const totalObligations = contracts.reduce((sum, c) => sum + c.obligations.length, 0);
  const completedObligations = contracts.reduce((sum, c) => sum + c.obligations.filter(o => o.completed).length, 0);
  const upcomingCount = upcomingObligations.filter(k => daysUntil(k.date) <= 30 && daysUntil(k.date) >= 0).length;
  const avgHealth = contracts.length > 0
    ? Math.round(contracts.reduce((s,c) => s + (c.healthScore || 70), 0) / contracts.length)
    : 0;

  const suggestedActions = contracts.flatMap(c =>
    c.actions.filter(a => a.status === "suggested").slice(0, 1).map(a => ({ ...a, contract: c }))
  ).slice(0, 3);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 hero-gradient">
        <header className="border-b border-border bg-bg/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Dashboard
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" /> Agent Monitoring
                </span>
              </h1>
              <p className="text-sm text-gray-400">AI agent is watching {contracts.length} contracts · {totalObligations} obligations tracked · Next scan in 4 hours</p>
            </div>
            <Link href="/app/upload" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium text-sm hover:opacity-90 transition shadow-lg shadow-indigo-500/20">
              <Upload className="w-4 h-4" /> Upload Contract
            </Link>
          </div>
        </header>

        <div className="p-8 space-y-6 fade-in">
          {loading ? (
            <div className="grid grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="glass rounded-xl p-5 h-28 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              <StatCard icon={<FileText className="w-5 h-5" />} label="Contracts" value={contracts.length} accent="indigo" />
              <HealthCard value={avgHealth} />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Due in 30 Days" value={upcomingCount} accent="cyan" />
              <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="High Risks" value={criticalRisks.length} accent="orange" />
              <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Obligations Done" value={`${completedObligations}/${totalObligations}`} accent="green" />
            </div>
          )}

          {/* Hero agent card */}
          <div className="glass rounded-2xl p-6 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 relative">
                  <Bot className="w-6 h-6 text-white" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-bg pulse-dot" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-white">ContractLens Agent</h2>
                    <span className="text-xs text-indigo-300">· Perceive → Reason → Act → Monitor</span>
                  </div>
                  <p className="text-gray-400 text-sm max-w-2xl mb-3">
                    Continuously analyzing your portfolio for deadlines, risks, market-standard deviations, and cross-contract conflicts.
                    {suggestedActions.length > 0 && <span className="text-white"> <strong>{suggestedActions.length} actions</strong> are ready for your review.</span>}
                  </p>
                  {conflicts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {conflicts.slice(0,3).map((alert, i) => (
                        <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${severityColor(alert.severity)}`}>
                          <AlertTriangle className="w-3 h-3" /> {alert.description.slice(0,75)}...
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/app/ask" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-indigo-500 text-sm text-white transition">
                  <Brain className="w-4 h-4 text-indigo-400" /> Talk to Agent
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Action Center */}
            <div className="col-span-2 glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" /> Action Center
                  <span className="text-xs text-gray-500 font-normal">· Agent-proposed next steps</span>
                </h3>
              </div>
              {suggestedActions.length === 0 && contracts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">Upload a contract to see agent-proposed actions.</div>
              ) : (
                <div className="space-y-2">
                  {contracts.flatMap(c => c.actions.filter(a => a.status === "suggested").slice(0, 2).map(a => ({ ...a, contract: c }))).slice(0, 5).map((a, i) => (
                    <div key={i} className="p-4 rounded-lg bg-surface/60 border border-border-light hover:border-indigo-500/50 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          {a.type === "email-draft" && <Mail className="w-4 h-4 text-indigo-400" />}
                          {a.type === "calendar-event" && <Calendar className="w-4 h-4 text-cyan-400" />}
                          {a.type === "negotiation-playbook" && <GitBranch className="w-4 h-4 text-orange-400" />}
                          {a.type === "counsel-review" && <ShieldCheck className="w-4 h-4 text-red-400" />}
                          {a.type === "summary-report" && <FileText className="w-4 h-4 text-green-400" />}
                          {a.type === "reminder" && <Bell className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-white text-sm">{a.title}</span>
                            <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-surface border border-border">{a.contract.title}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{a.description}</p>
                        </div>
                        <button onClick={() => router.push(`/app/contract/${a.contract.id}?action=${a.id}`)} className="text-xs px-3 py-1.5 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white font-medium shrink-0 transition">
                          Run action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio health */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Portfolio Health
              </h3>
              <div className="space-y-3">
                {contracts.map(c => (
                  <div key={c.id} className="cursor-pointer" onClick={() => router.push(`/app/contract/${c.id}`)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300 truncate flex-1">{c.title}</span>
                      <span className={`text-sm font-bold shrink-0 ml-2 ${
                        c.healthScore >= 80 ? "text-green-400" :
                        c.healthScore >= 65 ? "text-yellow-400" :
                        "text-red-400"
                      }`}>{c.healthScore}</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        c.healthScore >= 80 ? "bg-green-500" :
                        c.healthScore >= 65 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`} style={{ width: `${c.healthScore}%` }} />
                    </div>
                  </div>
                ))}
                {contracts.length === 0 && <div className="text-center py-8 text-gray-500 text-xs">No contracts yet</div>}
              </div>
              <div className="mt-4 pt-4 border-t border-border text-[11px] text-gray-500 flex items-center justify-between">
                <span>Health score based on risk flags, market benchmarks, completeness</span>
              </div>
            </div>
          </div>

          {/* Two column: deadlines + agent thinking */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Upcoming Key Dates
                </h3>
                <Link href="/app/timeline" className="text-xs text-indigo-400 hover:text-indigo-300">View timeline →</Link>
              </div>
              {upcomingObligations.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">No upcoming deadlines.</div>
              ) : (
                <div className="space-y-2">
                  {upcomingObligations.map((kd, i) => {
                    const days = daysUntil(kd.date);
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface/60 hover:bg-surface-2/60 transition border border-transparent hover:border-border-light cursor-pointer" onClick={() => router.push(`/app/contract/${kd.contract.id}`)}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          days < 0 ? "bg-gray-500/20 text-gray-400" :
                          days <= 14 ? "bg-red-500/20 text-red-400" :
                          days <= 45 ? "bg-orange-500/20 text-orange-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>
                          {days < 0 ? "PAST" : `${days}d`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">{kd.label}</div>
                          <div className="text-xs text-gray-400 truncate">{kd.contract.title}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-gray-400">{formatDate(kd.date)}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Agent thinking feed */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" /> Agent Activity
              </h3>
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {contracts.slice(0,1).flatMap(c => c.agentEvents || []).slice().reverse().slice(0, 7).map((e, i) => {
                  const iconMap: Record<string, any> = { parse: FileText, extract: Search, classify: Layers, benchmark: TrendingUp, "cross-reference": Database, recommend: Zap, monitor: Bell };
                  const Icon = iconMap[e.stage] || Activity;
                  const isLatest = i === 0;
                  return (
                    <div key={e.id} className="flex gap-2.5">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isLatest ? "bg-green-500/20 text-green-400" : "bg-indigo-500/15 text-indigo-400"
                        }`}>
                          {isLatest ? <CheckCircle2 className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                        </div>
                        {i < 6 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-3 flex-1">
                        <div className="text-xs text-white font-medium leading-tight">{e.message}</div>
                        {e.detail && <div className="text-[10px] text-gray-500 mt-0.5">{e.detail}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contracts grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Your Contracts
              </h3>
              <Link href="/app/contracts" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
            </div>
            {contracts.length === 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/app/upload" className="block glass rounded-xl p-10 text-center glass-hover transition group border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5">
                  <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">Upload your contract</h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">Drag & drop a PDF/DOCX. Instant AI analysis, health scoring, risks, missing clauses & actions.</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-300">Start now — no signup <ArrowUpRight className="w-3 h-3"/></div>
                </Link>
                <button onClick={loadDemo} className="glass rounded-xl p-10 text-center hover:border-indigo-500/30 transition group text-left">
                  <Layers className="w-12 h-12 text-gray-500 mx-auto mb-4 group-hover:text-indigo-400 transition" />
                  <h4 className="text-lg font-semibold text-white mb-2 text-center">Try with sample contracts</h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto text-center">Load 3 pre-analyzed sample contracts (MSA, Employment, NDA) to explore every feature risk-free.</p>
                  <div className="mt-4 text-center text-xs text-gray-500">Takes 2 seconds</div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {contracts.map(c => (
                  <Link key={c.id} href={`/app/contract/${c.id}`} className="glass rounded-xl p-5 glass-hover transition block group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className={`text-lg font-bold ${
                        c.healthScore >= 80 ? "text-green-400" :
                        c.healthScore >= 65 ? "text-yellow-400" :
                        "text-red-400"
                      }`}>{c.healthScore}<span className="text-[10px] text-gray-500">/100</span></div>
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-indigo-300 transition">{c.title}</h4>
                    <p className="text-xs text-gray-500 mb-3">{c.contractType}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>{c.obligations.length} obligations</span>
                      <span>·</span>
                      <span className="text-orange-400">{c.riskClauses.filter(r=>r.severity==="high"||r.severity==="critical").length} risks</span>
                      <span>·</span>
                      <span>{c.actions.filter(a=>a.status==="suggested").length} actions</span>
                    </div>
                  </Link>
                ))}
                <Link href="/app/upload" className="glass rounded-xl p-5 border-dashed border-gray-700 flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:border-indigo-500/50 transition min-h-[158px]">
                  <div className="text-center">
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-xs">Add contract</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; accent: "indigo" | "cyan" | "orange" | "green" }) {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30",
    orange: "from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/30",
    green: "from-green-500/20 to-green-500/5 text-green-400 border-green-500/30",
  };
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[accent]} border flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function HealthCard({ value }: { value: number }) {
  const color = value >= 80 ? "text-green-400" : value >= 65 ? "text-yellow-400" : "text-red-400";
  const ring = value >= 80 ? "from-green-500/20 to-green-500/5 border-green-500/30 text-green-400" :
               value >= 65 ? "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400" :
               "from-red-500/20 to-red-500/5 border-red-500/30 text-red-400";
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Portfolio Health</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ring} border flex items-center justify-center`}>
          <Activity className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-gray-500">/100</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {value >= 80 ? "Looking good" : value >= 65 ? "Needs attention" : "Review recommended"}
      </div>
    </div>
  );
}

function Mail({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
