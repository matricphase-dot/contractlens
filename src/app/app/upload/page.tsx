"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Upload, FileText, X, Check, Loader2, FileUp, Sparkles, AlertCircle, Bot, Search, Layers, TrendingUp, Database, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "uploading" | "analyzing" | "done" | "error";

const STAGES = [
  { key: "parse", label: "Parsing document", icon: FileText },
  { key: "extract", label: "Extracting parties & terms", icon: Search },
  { key: "classify", label: "Classifying obligations", icon: Layers },
  { key: "benchmark", label: "Benchmarking vs market", icon: TrendingUp },
  { key: "risks", label: "Scanning for risks", icon: AlertCircle },
  { key: "actions", label: "Preparing action plan", icon: Zap },
  { key: "monitor", label: "Adding to monitoring", icon: Activity },
];

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: Status;
  stage?: number;
  error?: string;
  contractId?: string;
}

export default function UploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => /\.(pdf|docx?|txt|md)$/i.test(f.name));
    const newItems: UploadItem[] = fileArr.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      progress: 0,
      status: "idle",
      stage: 0,
    }));
    setItems(prev => [...prev, ...newItems]);
    newItems.forEach(uploadFile);
  }, []);

  async function uploadFile(item: UploadItem) {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "uploading", progress: 20, stage: 0 } : i));
    const formData = new FormData();
    formData.append("file", item.file);

    // Simulate stage progression visually
    let stage = 0;
    const interval = setInterval(() => {
      stage = Math.min(stage + 1, STAGES.length - 1);
      setItems(prev => prev.map(i => i.id === item.id && i.status === "analyzing" ? { ...i, stage, progress: 20 + (stage / STAGES.length) * 80 } : i));
    }, 320);

    try {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "analyzing", progress: 25, stage: 0 } : i));
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      clearInterval(interval);
      // Persist new contract to localStorage so it survives stateless lambda cold starts
      if (data.contract) {
        try {
          const existing = JSON.parse(localStorage.getItem("contractlens:contracts") || "[]");
          const filtered = existing.filter((c: any) => c.id !== data.contract.id);
          filtered.push(data.contract);
          localStorage.setItem("contractlens:contracts", JSON.stringify(filtered));
          // Also seed server so subsequent detail-page fetches in this lambda work
          await fetch("/api/contracts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contracts: filtered }),
          }).catch(() => {});
        } catch (e) {}
      }
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "done", progress: 100, stage: STAGES.length - 1, contractId: data.contract?.id } : i));
    } catch (e: any) {
      clearInterval(interval);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "error", error: e.message } : i));
    }
  }

  function removeItem(id: string) { setItems(prev => prev.filter(i => i.id !== id)); }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <header className="border-b border-border bg-bg/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-white">Upload Contracts</h1>
            <p className="text-sm text-gray-400">Drop a contract — watch the agent parse, analyze, benchmark, and propose actions in real time.</p>
          </div>
        </header>

        <div className="p-8 max-w-3xl mx-auto fade-in">
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all",
              isDragging ? "border-indigo-400 bg-indigo-500/10" : "border-border bg-surface/30 hover:border-indigo-500/50 hover:bg-surface/50"
            )}
          >
            <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FileUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Drop contracts here or click to browse</h3>
            <p className="text-sm text-gray-400 mb-4">PDF, DOCX, TXT, Markdown · Max 10MB per file</p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 flex-wrap">
              <Feat icon={<Sparkles className="w-3 h-3" />} text="AI clause extraction" />
              <Feat icon={<TrendingUp className="w-3 h-3" />} text="Market benchmarking" />
              <Feat icon={<AlertCircle className="w-3 h-3" />} text="Risk flagging" />
              <Feat icon={<Zap className="w-3 h-3" />} text="Action plan generation" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-gray-500 flex-wrap">
            <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> Files processed in-session, never sold or shared</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> Every claim cited to source section</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> No account required</span>
          </div>

          {items.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Analysis Queue</h3>
              {items.map(item => (
                <div key={item.id} className="glass rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      item.status === "done" ? "bg-green-500/20 text-green-400" :
                      item.status === "error" ? "bg-red-500/20 text-red-400" :
                      "bg-indigo-500/20 text-indigo-400"
                    )}>
                      {item.status === "done" ? <Check className="w-5 h-5" /> :
                       item.status === "error" ? <AlertCircle className="w-5 h-5" /> :
                       item.status === "analyzing" ? <Bot className="w-5 h-5 animate-pulse" /> :
                       <Loader2 className="w-5 h-5 animate-spin" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white truncate">{item.file.name}</span>
                        <span className="text-xs text-gray-500 shrink-0 ml-2">{(item.file.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full transition-all duration-500",
                            item.status === "error" ? "bg-red-500" :
                            item.status === "done" ? "bg-green-500" :
                            "bg-gradient-to-r from-indigo-500 to-cyan-500"
                          )} style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-24 text-right">
                          {item.status === "uploading" && "Uploading..."}
                          {item.status === "analyzing" && (
                            <span className="inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" /> {STAGES[item.stage || 0].label}
                            </span>
                          )}
                          {item.status === "done" && "Complete"}
                          {item.status === "error" && (item.error || "Failed")}
                        </span>
                      </div>
                    </div>
                    {item.status === "done" && item.contractId ? (
                      <button onClick={() => router.push(`/app/contract/${item.contractId}`)} className="text-xs px-3 py-1.5 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white font-medium shrink-0 transition">View →</button>
                    ) : (
                      <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-white shrink-0"><X className="w-4 h-4" /></button>
                    )}
                  </div>

                  {item.status === "analyzing" && (
                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-7 gap-1">
                      {STAGES.map((s, i) => {
                        const done = (item.stage || 0) > i;
                        const current = (item.stage || 0) === i;
                        const Icon = s.icon;
                        return (
                          <div key={s.key} className="flex flex-col items-center gap-1 text-center">
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center transition",
                              done ? "bg-green-500/20 text-green-400" :
                              current ? "bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/30 animate-pulse" :
                              "bg-border text-gray-600"
                            )}>
                              {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                            </div>
                            <div className={cn("text-[9px] leading-tight", done || current ? "text-gray-300" : "text-gray-600")}>{s.label.split(" ")[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 glass rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" /> What the agent does during analysis
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
              <ul className="space-y-1">
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><Search className="w-3 h-3" /></span>Parses document structure & sections</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><Database className="w-3 h-3" /></span>Extracts parties, dates, terms, payments</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><Layers className="w-3 h-3" /></span>Classifies obligations by party & severity</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><TrendingUp className="w-3 h-3" /></span>Benchmarks clauses against market data</li>
              </ul>
              <ul className="space-y-1">
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><AlertCircle className="w-3 h-3" /></span>Flags risky/ambiguous clauses</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><Zap className="w-3 h-3" /></span>Generates negotiation playbooks, emails, calendar events</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><Activity className="w-3 h-3" /></span>Sets up 24/7 deadline monitoring</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5"><Sparkles className="w-3 h-3" /></span>Cross-references portfolio for conflicts</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <span className="inline-flex items-center gap-1.5">{<span className="text-indigo-400">{icon}</span>}{text}</span>;
}
