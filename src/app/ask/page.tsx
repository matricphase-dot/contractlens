"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import type { Contract, ChatMessage } from "@/lib/types";
import { MessageSquare, Send, Sparkles, BookOpen, AlertTriangle, Calendar, DollarSign, User, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  { icon: AlertTriangle, text: "What are the riskiest clauses across my contracts?" },
  { icon: Calendar, text: "Which renewal deadlines are coming up next?" },
  { icon: DollarSign, text: "What are my total monthly payment obligations?" },
  { icon: BookOpen, text: "Explain the termination rights in simple terms" },
  { icon: MessageSquare, text: "What happens if I miss a renewal deadline?" },
];

function AskContent() {
  const searchParams = useSearchParams();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedId, setSelectedId] = useState<string>("all");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/contracts").then(r => r.json()).then(d => setContracts(d.contracts || []));
    const c = searchParams.get("contract");
    if (c) setSelectedId(c);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your ContractLens AI agent. I can answer questions about any of your contracts — obligations, deadlines, payment terms, risks, renewal clauses, or anything else. What would you like to know?",
      timestamp: new Date().toISOString(),
    }]);
  }, [searchParams]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text?: string) {
    const q = (text || input).trim();
    if (!q || sending) return;
    setInput("");
    const userMsg: ChatMessage = { id: Math.random().toString(36).slice(2), role: "user", content: q, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setSending(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, contractId: selectedId }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: data.answer || "Sorry, I couldn't process that.",
        citations: data.citations,
        timestamp: new Date().toISOString(),
      };
      setMessages(m => [...m, aiMsg]);
    } catch {
      setMessages(m => [...m, { id: Math.random().toString(36).slice(2), role: "assistant", content: "Error connecting to the agent. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border bg-bg/40 backdrop-blur-sm sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-400" /> Ask Your Contracts
              </h1>
              <p className="text-sm text-gray-400">Natural language questions about your entire contract portfolio</p>
            </div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All contracts ({contracts.length})</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""} fade-in`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${m.role === "user" ? "order-first" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-indigo-500 text-white rounded-br-sm"
                      : "glass rounded-bl-sm prose-contract"
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                  </div>
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {m.citations.map((cite, i) => (
                        <div key={i} className="text-xs text-gray-500 flex items-start gap-2 p-2 rounded bg-surface/50 border border-border/50">
                          <BookOpen className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-400">{cite.section}</span>, p.{cite.page}
                            <div className="text-gray-600 italic">"{cite.excerpt.slice(0, 140)}..."</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex gap-3 fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <div className="typing-dot w-2 h-2 rounded-full bg-gray-400" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-gray-400" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {messages.length <= 1 && !sending && (
          <div className="px-8 pb-2 max-w-3xl mx-auto w-full">
            <div className="text-xs text-gray-500 mb-2 font-medium">Try asking:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() => send(s.text)}
                    className="text-left glass rounded-lg p-3 text-sm text-gray-300 hover:border-indigo-500 transition flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{s.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-8 py-4 border-t border-border bg-bg/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about your contracts..."
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 text-center text-[10px] text-gray-600">
            AI responses are sourced from your uploaded contracts. Always verify critical legal/financial details.
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-gray-400 bg-bg">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AskContent />
    </Suspense>
  );
}
