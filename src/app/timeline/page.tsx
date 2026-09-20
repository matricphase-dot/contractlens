"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import type { Contract } from "@/lib/types";
import { formatDate, daysUntil, severityColor } from "@/lib/utils";
import { Calendar, Clock, AlertTriangle, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";

export default function TimelinePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts").then(r => r.json()).then(d => {
      setContracts(d.contracts || []);
      setLoading(false);
    });
  }, []);

  // Gather all dated items, normalize to timeline entries
  type Entry = { date: Date; label: string; type: string; severity?: string; contract: Contract; source: string; description: string };
  const entries: Entry[] = [];
  contracts.forEach(c => {
    c.keyDates.forEach(kd => entries.push({
      date: new Date(kd.date),
      label: kd.label,
      type: kd.type,
      contract: c,
      source: kd.sourceSection,
      description: kd.description,
      severity: kd.type === "renewal" || kd.type === "expiration" ? "high" : kd.type === "payment-due" ? "medium" : "low",
    }));
    c.obligations.filter(o => o.dueDate).forEach(o => entries.push({
      date: new Date(o.dueDate!),
      label: o.description.slice(0, 80),
      type: o.category,
      severity: o.severity,
      contract: c,
      source: o.sourceSection,
      description: o.description,
    }));
  });

  entries.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by month
  const grouped: Record<string, Entry[]> = {};
  entries.forEach(e => {
    const key = e.date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    (grouped[key] = grouped[key] || []).push(e);
  });

  const now = new Date();
  const upcoming = entries.filter(e => e.date.getTime() >= now.getTime() - 86400000);
  const overdue = entries.filter(e => e.date.getTime() < now.getTime() - 86400000);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <header className="border-b border-border bg-bg/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-white">Obligation Timeline</h1>
            <p className="text-sm text-gray-400">Every deadline, renewal, and deliverable across your contract portfolio in one view.</p>
          </div>
        </header>

        <div className="p-8 fade-in">
          {/* Alert banner */}
          {upcoming.slice(0,1).some(e => daysUntil(e.date.toISOString()) <= 14) && (
            <div className="mb-6 glass rounded-xl p-4 border-orange-500/30 bg-orange-500/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">Urgent: Upcoming deadline</div>
                <p className="text-xs text-gray-400">
                  {upcoming.filter(e => daysUntil(e.date.toISOString()) <= 14 && daysUntil(e.date.toISOString()) >= 0).length} item(s) require action within the next 14 days.
                </p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium border border-orange-500/30 hover:bg-orange-500/30 transition">
                Set reminder
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Overdue</div>
              <div className="text-2xl font-bold text-red-400">{overdue.length}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Next 14 days</div>
              <div className="text-2xl font-bold text-orange-400">{upcoming.filter(e => daysUntil(e.date.toISOString()) <= 14 && daysUntil(e.date.toISOString()) >= 0).length}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">15–90 days</div>
              <div className="text-2xl font-bold text-yellow-400">{upcoming.filter(e => { const d = daysUntil(e.date.toISOString()); return d > 14 && d <= 90; }).length}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Beyond 90 days</div>
              <div className="text-2xl font-bold text-green-400">{upcoming.filter(e => daysUntil(e.date.toISOString()) > 90).length}</div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass rounded-xl p-5 h-20 animate-pulse" />)}</div>
          ) : entries.length === 0 ? (
            <div className="glass rounded-xl p-16 text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              No dated obligations found. Upload contracts to populate the timeline.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([month, monthEntries]) => (
                <div key={month}>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> {month}
                    <span className="text-xs text-gray-500 font-normal">({monthEntries.length} {monthEntries.length === 1 ? "item" : "items"})</span>
                  </h3>
                  <div className="glass rounded-xl overflow-hidden">
                    {monthEntries.map((e, i) => {
                      const days = daysUntil(e.date.toISOString());
                      return (
                        <Link key={i} href={`/contract/${e.contract.id}`} className={`flex items-center gap-4 p-4 hover:bg-white/5 transition ${i < monthEntries.length - 1 ? "border-b border-border/50" : ""}`}>
                          <div className={`w-14 text-center shrink-0 rounded-lg py-2 ${
                            days < 0 ? "bg-red-500/10 text-red-400" :
                            days <= 14 ? "bg-orange-500/10 text-orange-400" :
                            days <= 45 ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-surface text-gray-300"
                          }`}>
                            <div className="text-xs font-medium uppercase">{e.date.toLocaleDateString("en-US", { month: "short" })}</div>
                            <div className="text-xl font-bold">{e.date.getDate()}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm">{e.label}</div>
                            <div className="text-xs text-gray-500 truncate flex items-center gap-2 mt-0.5">
                              <span>{e.contract.title}</span>
                              <span>·</span>
                              <span className="capitalize">{e.type.replace("-", " ")}</span>
                              <span>·</span>
                              <span className="text-gray-600">{e.source}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {days < 0 ? (
                              <span className="text-xs text-red-400 font-medium">{Math.abs(days)}d overdue</span>
                            ) : days === 0 ? (
                              <span className="text-xs text-orange-400 font-medium">Today</span>
                            ) : (
                              <span className={`text-xs ${days <= 14 ? "text-orange-400" : "text-gray-400"} font-medium`}>In {days} days</span>
                            )}
                            {e.severity && (
                              <div className={`mt-1 text-[10px] px-1.5 py-0.5 rounded border inline-block ${severityColor(e.severity)}`}>
                                {e.severity}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
