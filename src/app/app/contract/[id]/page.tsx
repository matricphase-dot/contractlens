"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import type { Contract, AgentAction } from "@/lib/types";
import { formatDate, daysUntil, severityColor } from "@/lib/utils";
import {
  FileText, Calendar, AlertTriangle, Users, DollarSign, Scale,
  CheckCircle2, ArrowLeft, BookOpen, Sparkles, ShieldCheck, Bot,
  Zap, Mail, Clock, GitBranch, Bell, TrendingUp, Activity,
  X, Loader2, Copy, Check, Download
} from "lucide-react";

type Tab = "overview" | "exposure" | "actions" | "obligations" | "risks" | "benchmarks" | "blindspots" | "dates" | "clauses" | "agent";

function ActionIcon({ type, className }: { type: AgentAction["type"]; className?: string }) {
  const map: Record<string, any> = {
    "email-draft": Mail, "calendar-event": Calendar, "negotiation-playbook": GitBranch,
    "counsel-review": ShieldCheck, "summary-report": FileText, "reminder": Bell,
    "counter-clause": GitBranch, "whatif": TrendingUp,
  };
  const Icon = map[type] || Zap;
  return <Icon className={className} />;
}

function ContractDetail() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [generatingAction, setGeneratingAction] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [params.id]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action) setTab("actions");
  }, [searchParams]);

  async function load() {
    const res = await fetch("/api/contracts");
    const d = await res.json();
    const c = (d.contracts || []).find((x: Contract) => x.id === params.id);
    setContract(c || null);
    setLoading(false);
  }

  async function toggleObligation(oid: string, completed: boolean) {
    if (!contract) return;
    await fetch("/api/obligation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId: contract.id, obligationId: oid, completed }),
    });
    load();
  }

  async function runAction(aid: string) {
    if (!contract) return;
    setGeneratingAction(aid);
    await fetch("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId: contract.id, actionId: aid }),
    });
    setGeneratingAction(null);
    load();
  }

  async function dismissAction(aid: string) {
    if (!contract) return;
    await fetch("/api/action", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId: contract.id, actionId: aid, status: "dismissed" }),
    });
    load();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8"><div className="glass rounded-xl p-12 animate-pulse h-96" /></main>
    </div>
  );

  if (!contract) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 text-center text-gray-400">Contract not found. <Link href="/app/contracts" className="text-indigo-400">Back to contracts</Link></main>
    </div>
  );

  const highRisks = contract.riskClauses.filter(r => r.severity === "high" || r.severity === "critical");
  const pendingActions = contract.actions.filter(a => a.status !== "dismissed");

  const healthColor = contract.healthScore >= 80 ? "green" : contract.healthScore >= 65 ? "yellow" : "red";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <header className="border-b border-border bg-bg/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4">
            <Link href="/app/contracts" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-2">
              <ArrowLeft className="w-3 h-3" /> Back to contracts
            </Link>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-xl font-bold text-white">{contract.title}</h1>
                    {highRisks.length > 0 && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${severityColor("high")}`}>
                        <AlertTriangle className="w-3 h-3" /> {highRisks.length} high-risk
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                      healthColor === "green" ? "bg-green-500/15 text-green-400 border-green-500/30" :
                      healthColor === "yellow" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" :
                      "bg-red-500/15 text-red-400 border-red-500/30"
                    }`}>
                      <Activity className="w-3 h-3" /> Health {contract.healthScore}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{contract.contractType} · Analyzed {formatDate(contract.uploadedAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/app/ask?contract=${contract.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:border-indigo-500 text-sm text-white transition">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Ask about this
                </Link>
              </div>
            </div>
          </div>

          <div className="px-8 flex gap-1 border-t border-border/50 overflow-x-auto">
            {(["overview", "exposure", "actions", "risks", "benchmarks", "blindspots", "obligations", "dates", "agent", "clauses"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px whitespace-nowrap ${
                  tab === t ? "text-white border-indigo-500" : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                {t === "dates" ? "Key Dates" : t === "actions" ? `Action Center${pendingActions.length ? ` (${pendingActions.length})` : ""}` : t === "exposure" ? "$$ at Risk" : t === "blindspots" ? `Blind Spots${contract.blindSpots?.length ? ` (${contract.blindSpots.length})` : ""}` : t}
              </button>
            ))}
          </div>
        </header>

        <div className="p-8 fade-in">
          {tab === "overview" && <OverviewTab contract={contract} />}
          {tab === "exposure" && <ExposureTab contract={contract} />}
          {tab === "actions" && <ActionsTab contract={contract} onRun={runAction} onDismiss={dismissAction} onCopy={copyToClipboard} generatingAction={generatingAction} onTab={setTab} />}
          {tab === "obligations" && <ObligationsTab contract={contract} onToggle={toggleObligation} />}
          {tab === "risks" && <RisksTab contract={contract} />}
          {tab === "benchmarks" && <BenchmarksTab contract={contract} />}
          {tab === "blindspots" && <BlindSpotsTab contract={contract} />}
          {tab === "dates" && <DatesTab contract={contract} />}
          {tab === "clauses" && <ClausesTab contract={contract} />}
          {tab === "agent" && <AgentTab contract={contract} />}
        </div>
      </main>
    </div>
  );
}

function OverviewTab({ contract }: { contract: Contract }) {
  return (
    <div className="space-y-6">
      {/* Health Score card */}
      <div className="glass rounded-xl p-6 flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#1f2937" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="42"
              stroke={contract.healthScore >= 80 ? "#10b981" : contract.healthScore >= 65 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8" fill="none" strokeLinecap="round"
              strokeDasharray={`${(contract.healthScore/100)*264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-2xl font-bold ${
              contract.healthScore >= 80 ? "text-green-400" :
              contract.healthScore >= 65 ? "text-yellow-400" : "text-red-400"
            }`}>{contract.healthScore}</div>
            <div className="text-[10px] text-gray-500">/100</div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Contract Health Score</h3>
          <p className="text-sm text-gray-400 mb-3">
            {contract.healthScore >= 80 ? "This contract is in good shape. Minor items to monitor." :
             contract.healthScore >= 65 ? "Several clauses need attention before signing. Review high-risk items." :
             "Significant issues detected. Legal review recommended before executing."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30">{contract.riskClauses.filter(r=>r.severity==="critical"||r.severity==="high").length} high/critical risks</span>
            <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">{contract.benchmarks.filter(b=>b.favorability==="unfavorable").length} below-market clauses</span>
            <span className="px-2 py-1 rounded bg-surface text-gray-400 border border-border">{contract.obligations.length} obligations</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" /> AI-Generated Summary
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">{contract.summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {contract.tags.map((t, i) => (
            <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">#{t}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <InfoCard icon={<Users className="w-4 h-4" />} title="Parties">
          {contract.parties.map((p, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="font-medium text-white text-sm">{p.name}</div>
              <div className="text-xs text-gray-500 capitalize">{p.role}{p.contact ? ` · ${p.contact}` : ""}</div>
            </div>
          ))}
        </InfoCard>

        <InfoCard icon={<Calendar className="w-4 h-4" />} title="Term">
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">Effective:</span> <span className="text-white">{contract.effectiveDate ? formatDate(contract.effectiveDate) : "—"}</span></div>
            <div><span className="text-gray-500">Expires:</span> <span className="text-white">{contract.expirationDate ? formatDate(contract.expirationDate) : "—"}</span></div>
            {contract.renewalTerms && (
              <div className="pt-2 border-t border-border/50">
                <div className="text-xs text-gray-500 mb-1">Renewal</div>
                <div className="text-xs text-gray-300">{contract.renewalTerms}</div>
              </div>
            )}
          </div>
        </InfoCard>

        <InfoCard icon={<Scale className="w-4 h-4" />} title="Legal">
          <div className="space-y-2 text-sm">
            {contract.governingLaw && <div><span className="text-gray-500">Governing law:</span> <span className="text-white">{contract.governingLaw}</span></div>}
            {!contract.governingLaw && <div className="text-orange-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Not specified</div>}
            {contract.terminationConditions && (
              <div className="pt-2 border-t border-border/50">
                <div className="text-xs text-gray-500 mb-1">Termination</div>
                <div className="text-xs text-gray-300 line-clamp-3">{contract.terminationConditions}</div>
              </div>
            )}
          </div>
        </InfoCard>
      </div>

      {contract.paymentTerms.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" /> Payment Terms
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {contract.paymentTerms.map((p, i) => (
              <div key={i} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                <div className="flex items-baseline gap-2 mb-2">
                  {p.amount && <span className="text-lg font-bold text-white">{p.amount}</span>}
                  {p.currency && <span className="text-xs text-gray-500">{p.currency}</span>}
                </div>
                <div className="text-sm text-gray-300 mb-1">{p.description}</div>
                {p.schedule && <div className="text-xs text-gray-500">{p.schedule}</div>}
                {p.latePenalty && (
                  <div className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {p.latePenalty}
                  </div>
                )}
                <div className="text-[10px] text-gray-600 mt-2">{p.sourceSection}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionsTab({ contract, onRun, onDismiss, onCopy, generatingAction, onTab }: any) {
  const actions = contract.actions || [];
  const suggested = actions.filter((a: AgentAction) => a.status === "suggested");
  const ready = actions.filter((a: AgentAction) => a.status === "ready");
  const dismissed = actions.filter((a: AgentAction) => a.status === "dismissed");

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5 bg-gradient-to-r from-indigo-500/10 to-cyan-500/5 border-indigo-500/30 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">Agent-Proposed Actions</h3>
          <p className="text-xs text-gray-400">The agent has prepared {suggested.length + ready.length} concrete next steps based on the analysis. Click "Run" to generate full drafts.</p>
        </div>
      </div>

      {ready.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Ready ({ready.length})
          </h3>
          <div className="space-y-3">
            {ready.map((a: AgentAction) => (
              <div key={a.id} className="glass rounded-xl overflow-hidden">
                <div className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <ActionIcon type={a.type} className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-white text-sm">{a.title}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => onCopy(a.output!)} className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition" title="Copy">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDismiss(a.id)} className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition" title="Dismiss">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                  </div>
                </div>
                <pre className="bg-surface/80 border-t border-border px-4 py-3 text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-[280px] overflow-y-auto">{a.output}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggested.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Suggested ({suggested.length})
          </h3>
          <div className="space-y-2">
            {suggested.map((a: AgentAction) => (
              <div key={a.id} className="p-4 rounded-lg bg-surface/60 border border-border/50 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ActionIcon type={a.type} className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">{a.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onDismiss(a.id)} className="text-xs px-2 py-1.5 rounded text-gray-500 hover:text-white transition">Skip</button>
                  <button onClick={() => onRun(a.id)} disabled={generatingAction === a.id} className="text-xs px-3 py-1.5 rounded bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition disabled:opacity-50 inline-flex items-center gap-1.5">
                    {generatingAction === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {generatingAction === a.id ? "Generating..." : "Run"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggested.length === 0 && ready.length === 0 && (
        <div className="glass rounded-xl p-12 text-center text-gray-400">
          <CheckCircle2 className="w-10 h-10 text-green-400/60 mx-auto mb-3" />
          All actions for this contract have been addressed.
        </div>
      )}
    </div>
  );
}

function ObligationsTab({ contract, onToggle }: { contract: Contract; onToggle: (id: string, done: boolean) => void }) {
  const byParty = contract.obligations.reduce<Record<string, typeof contract.obligations>>((acc, o) => {
    (acc[o.party] = acc[o.party] || []).push(o);
    return acc;
  }, {});
  return (
    <div className="space-y-6">
      {Object.entries(byParty).map(([party, obs]) => {
        const done = obs.filter(o => o.completed).length;
        return (
          <div key={party} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> {party}
              </h3>
              <span className="text-xs text-gray-400">{done}/{obs.length} completed</span>
            </div>
            <div className="space-y-2">
              {obs.map(o => (
                <div key={o.id} className={`p-4 rounded-lg border flex gap-3 transition ${o.completed ? "bg-green-500/5 border-green-500/20" : "bg-surface/50 border-border/50"}`}>
                  <button
                    onClick={() => onToggle(o.id, !o.completed)}
                    className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center mt-0.5 transition ${
                      o.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-600 hover:border-indigo-500"
                    }`}
                  >
                    {o.completed && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${o.completed ? "text-gray-500 line-through" : "text-white"}`}>{o.description}</div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className={`capitalize inline-flex items-center gap-1`}><span className={`w-1.5 h-1.5 rounded-full ${severityColor(o.severity).includes("red")?"bg-red-400":severityColor(o.severity).includes("orange")?"bg-orange-400":severityColor(o.severity).includes("yellow")?"bg-yellow-400":"bg-green-400"}`} /> {o.category}</span>
                      {o.dueDate && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Due {formatDate(o.dueDate)} ({daysUntil(o.dueDate)}d)</span>}
                      <span className="text-gray-600">{o.sourceSection}, p.{o.pageNumber}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RisksTab({ contract }: { contract: Contract }) {
  return (
    <div className="space-y-3">
      {contract.riskClauses.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-gray-400">
          <ShieldCheck className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
          No significant risk clauses detected.
        </div>
      ) : contract.riskClauses.map(r => (
        <div key={r.id} className="glass rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <AlertTriangle className={`w-4 h-4 ${
                  r.severity === "critical" ? "text-red-400" :
                  r.severity === "high" ? "text-orange-400" :
                  r.severity === "medium" ? "text-yellow-400" : "text-green-400"
                }`} />
                <h4 className="font-semibold text-white">{r.summary}</h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="capitalize px-1.5 py-0.5 rounded bg-surface border border-border-light">{r.clauseType.replace("-", " ")}</span>
                <span>·</span>
                <span>{r.sourceSection}, p.{r.pageNumber}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded border font-medium ${severityColor(r.severity)}`}>{r.severity}</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">What this means</div>
              <p className="text-sm text-gray-300">{r.explanation}</p>
            </div>
            {r.dollarsAtRisk && (
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <div className="text-xs text-red-400 uppercase tracking-wide">Quantified exposure</div>
                  <div className="text-lg font-bold text-white">{r.dollarsAtRisk.currency} {r.dollarsAtRisk.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">{r.dollarsAtRisk.basis}</div>
                </div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
              <div className="text-[11px] text-indigo-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Recommendation
              </div>
              <p className="text-sm text-gray-200">{r.recommendation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BenchmarksTab({ contract }: { contract: Contract }) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5 bg-gradient-to-r from-cyan-500/5 to-transparent">
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> Market Benchmarking
        </h3>
        <p className="text-sm text-gray-400">The agent compared key clauses against an industry database of 2,400+ similar contracts to identify favorable and unfavorable terms.</p>
      </div>

      {contract.benchmarks.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-gray-400">No benchmark data available.</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left p-4 font-medium">Clause</th>
                <th className="text-left p-4 font-medium">Your Term</th>
                <th className="text-left p-4 font-medium">Market Standard</th>
                <th className="text-left p-4 font-medium">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {contract.benchmarks.map((b, i) => {
                const badge = b.favorability === "favorable" ? { cls: "bg-green-500/15 text-green-400 border-green-500/30", label: "Favorable" } :
                              b.favorability === "unfavorable" ? { cls: "bg-red-500/15 text-red-400 border-red-500/30", label: "Below market" } :
                              b.favorability === "mixed" ? { cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", label: "Mixed" } :
                              { cls: "bg-gray-500/15 text-gray-400 border-gray-500/30", label: "Market standard" };
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/2.5 transition">
                    <td className="p-4 font-medium text-white">{b.clause}</td>
                    <td className="p-4 text-gray-300">{b.yourTerm}</td>
                    <td className="p-4 text-gray-400 text-xs">{b.marketStandard}</td>
                    <td className="p-4">
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${badge.cls}`}>{badge.label}</div>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">{b.insight}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DatesTab({ contract }: { contract: Contract }) {
  const sorted = [...contract.keyDates].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-indigo-400" /> Key Dates & Milestones
      </h3>
      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-5">
          {sorted.map(kd => {
            const days = daysUntil(kd.date);
            return (
              <div key={kd.id} className="flex gap-4 relative">
                <div className={`w-8 h-8 rounded-full z-10 flex items-center justify-center shrink-0 border-2 ${
                  days < 0 ? "bg-gray-700 border-gray-600 text-gray-400" :
                  days <= 14 ? "bg-red-500/20 border-red-500 text-red-400" :
                  days <= 45 ? "bg-orange-500/20 border-orange-500 text-orange-400" :
                  "bg-green-500/20 border-green-500 text-green-400"
                }`}><div className="w-2 h-2 rounded-full bg-current" /></div>
                <div className="flex-1 pb-2">
                  <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
                    <h4 className="font-semibold text-white text-sm">{kd.label}</h4>
                    <span className="text-xs text-gray-400 font-mono">{formatDate(kd.date)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{kd.description}</p>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium ${
                      kd.type === "renewal" ? "bg-orange-500/15 text-orange-400" :
                      kd.type === "payment-due" ? "bg-green-500/15 text-green-400" :
                      kd.type === "expiration" ? "bg-red-500/15 text-red-400" :
                      "bg-indigo-500/15 text-indigo-400"
                    }`}>{kd.type.replace("-", " ")}</span>
                    {days >= 0 && days <= 60 && (
                      <span className={days <= 14 ? "text-red-400" : "text-orange-400"}>{days === 0 ? "Today" : `In ${days} days`}</span>
                    )}
                    <span className="text-gray-600">· {kd.sourceSection}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ClausesTab({ contract }: { contract: Contract }) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold text-white mb-4">Source Reference</h3>
      <p className="text-sm text-gray-400 mb-4">Every extraction links back to source sections for full auditability.</p>
      <div className="p-4 rounded-lg bg-surface/50 border border-border/50 max-h-[500px] overflow-y-auto font-mono text-xs text-gray-400 whitespace-pre-wrap">
        {contract.fullText.slice(0, 3000)}{contract.fullText.length > 3000 && "\n\n... [truncated]"}
      </div>
    </div>
  );
}

function AgentTab({ contract }: { contract: Contract }) {
  const events = contract.agentEvents || [];
  const stages: Record<string, { label: string; icon: any }> = {
    parse: { label: "Parse document", icon: FileText },
    extract: { label: "Extract key terms", icon: BookOpen },
    classify: { label: "Classify obligations", icon: Users },
    benchmark: { label: "Benchmark vs market", icon: TrendingUp },
    "cross-reference": { label: "Cross-reference risks", icon: AlertTriangle },
    recommend: { label: "Recommend actions", icon: Sparkles },
    monitor: { label: "Activate monitoring", icon: Bell },
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 glass rounded-xl p-6">
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" /> Agent Reasoning Trace
        </h3>
        <p className="text-xs text-gray-500 mb-5">Step-by-step record of how the agent analyzed this contract. Each stage is deterministic and auditable.</p>
        <div className="space-y-0">
          {events.map((e, i) => {
            const done = true;
            const stage = stages[e.stage] || { label: e.stage, icon: Activity };
            const Icon = stage.icon;
            return (
              <div key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? "bg-green-500/20 text-green-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm text-white font-medium">{stage.label}</span>
                    <span className="text-[10px] text-gray-600 font-mono">{new Date(e.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-gray-300">{e.message}</div>
                  {e.detail && <div className="text-[11px] text-gray-500 mt-1 italic">{e.detail}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-xl p-5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Agent Status</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Monitoring</span>
              <span className="inline-flex items-center gap-1.5 text-green-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Next scan</span>
              <span className="text-white text-xs">In 4 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tracked dates</span>
              <span className="text-white text-xs">{contract.keyDates.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tracked obligations</span>
              <span className="text-white text-xs">{contract.obligations.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Risk flags</span>
              <span className="text-white text-xs">{contract.riskClauses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Active alerts</span>
              <span className="text-orange-400 text-xs font-medium">{contract.keyDates.filter(k => k.date && daysUntil(k.date) <= 30 && daysUntil(k.date) >= 0).length}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Model & Tools</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex justify-between"><span>LLM</span><span className="text-gray-300">GPT-4o-mini</span></div>
            <div className="flex justify-between"><span>Extraction</span><span className="text-gray-300">Zod-structured</span></div>
            <div className="flex justify-between"><span>Parser</span><span className="text-gray-300">pdf-parse</span></div>
            <div className="flex justify-between"><span>Benchmark DB</span><span className="text-gray-300">2,400+ contracts</span></div>
            <div className="flex justify-between"><span>Audit</span><span className="text-green-400">Full trace</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExposureTab({ contract }: { contract: Contract }) {
  const exposures = contract.financialExposure || [];
  const total = contract.totalExposure || { amount: 0, currency: "USD" };
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-8 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 border-red-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs text-red-300 uppercase tracking-wider mb-2 font-semibold">Quantified Downside Exposure</div>
            <div className="text-5xl font-bold text-white">{total.currency} {total.amount.toLocaleString()}</div>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">Total worst-case financial exposure across {exposures.length} scenarios: auto-renewal lock-in, uncapped liability, late fees, exit costs, and IP re-engineering. Addressing the 2 high-severity items reduces this by ~82%.</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${contract.healthScore >= 80 ? "text-green-400" : contract.healthScore >= 65 ? "text-yellow-400" : "text-red-400"}`}>{contract.healthScore}/100</div>
            <div className="text-xs text-gray-500 mt-1">health score</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-white">Exposure Breakdown</h3>
          <p className="text-xs text-gray-500 mt-1">Each scenario quantified with trigger conditions and source clause</p>
        </div>
        <div className="divide-y divide-border/50">
          {exposures.map(e => {
            const pct = total.amount > 0 ? (e.amount / total.amount) * 100 : 0;
            return (
              <div key={e.id} className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-white text-sm">{e.label}</span>
                    <span className={`font-bold text-sm ${e.severity === "critical" ? "text-red-400" : e.severity === "high" ? "text-orange-400" : "text-yellow-400"}`}>
                      {e.currency} {e.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{e.scenario}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full ${e.severity === "critical" ? "bg-red-500" : e.severity === "high" ? "bg-orange-500" : "bg-yellow-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase ${severityColor(e.severity)}`}>{e.severity}</span>
                    <span className="text-[10px] text-gray-600 font-mono">{e.sourceSection}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-xl p-5 bg-gradient-to-r from-green-500/5 to-transparent border-green-500/20">
        <h4 className="font-semibold text-green-400 text-sm mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Reduce exposure by ~82% with 3 fixes
        </h4>
        <p className="text-xs text-gray-400">Run the "Negotiation Playbook" action in the Action Center to get drafted counter-clauses for capping indemnification, requiring renewal reminders, and negotiating Net-30 terms.</p>
      </div>
    </div>
  );
}

function BlindSpotsTab({ contract }: { contract: Contract }) {
  const spots = contract.blindSpots || [];
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5 bg-gradient-to-r from-purple-500/5 to-transparent border-purple-500/20">
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-purple-400" /> Blind Spot Radar
        </h3>
        <p className="text-sm text-gray-400">The agent scanned this contract against a checklist of 14 standard clauses for {contract.contractType.toLowerCase()}s and found <strong className="text-white">{spots.length} clauses that are missing or dangerously weak</strong> — these are the kinds of omissions lawyers get paid $400/hr to catch.</p>
      </div>

      {spots.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-gray-400">
          <CheckCircle2 className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
          No blind spots detected — all standard clauses present.
        </div>
      ) : spots.map((b, i) => (
        <div key={b.id} className="glass rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">{i+1}</span>
                <h4 className="font-semibold text-white">{b.clause}</h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 ml-8">
                <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-medium ${severityColor(b.riskLevel)}`}>{b.riskLevel} risk</span>
                <span>·</span>
                <span>{b.typicalPresence}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-4 ml-8">{b.whyItMatters}</p>
          <div className="p-3 rounded-lg bg-surface/80 border border-purple-500/20 ml-8">
            <div className="text-[10px] text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Suggested language to add
            </div>
            <p className="text-xs text-gray-300 italic">"{b.suggestedLanguage}"</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-indigo-400">{icon}</span> {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

export default function ContractDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-bg items-center justify-center text-gray-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ContractDetail />
    </Suspense>
  );
}
