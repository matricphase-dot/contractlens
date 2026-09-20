"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, SkipForward, Pause, RotateCcw } from "lucide-react";

interface Step {
  route: string;
  duration: number;
  narration: string;
  highlight?: string;
  title: string;
}

const SCRIPT: Step[] = [
  {
    route: "/",
    duration: 18,
    title: "1. Dashboard — Portfolio Overview",
    narration: "Contracts are the most important document in business — and the worst managed. ContractLens is a proactive AI agent that doesn't just read your contracts, it stays on the job. This is the dashboard: your portfolio health score, active agent status, upcoming deadlines, cross-contract conflict alerts, and agent-proposed actions all in one place."
  },
  {
    route: "/",
    duration: 8,
    title: "2. Cross-Contract Conflict Detection",
    narration: "Notice the alert bar — the agent detects cross-contract issues no single-contract tool would ever find. Like two contracts renewing within days of each other, which means legal and finance will drown.",
    highlight: "alert"
  },
  {
    route: "/upload",
    duration: 15,
    title: "3. Upload — Watch the Agent Work",
    narration: "Drop a contract and watch the 7-stage agent pipeline light up in real time: Parse, Extract, Classify, Benchmark, Scan Risks, Prepare Actions, Activate Monitoring. You're not looking at a black box — you see the agent think."
  },
  {
    route: "/contracts",
    duration: 8,
    title: "4. Contract Portfolio",
    narration: "Three demo contracts are pre-loaded so everything works immediately: a SaaS MSA, an Indian employment agreement, and a mutual NDA. Each shows its health score at a glance."
  },
  {
    route: "/timeline",
    duration: 12,
    title: "5. Obligation Timeline",
    narration: "The timeline shows every deadline across all contracts, grouped by month and color-coded by urgency. Red items need action within 14 days, orange within 45."
  },
];

// We'll auto-navigate; but for simplicity, render a guided narrator overlay
export default function DemoPage() {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setElapsed(e => {
        const step = SCRIPT[stepIdx];
        if (e + 0.1 >= step.duration) {
          if (stepIdx < SCRIPT.length - 1) {
            setStepIdx(i => {
              const next = i + 1;
              router.push(SCRIPT[next].route);
              return next;
            });
            return 0;
          } else {
            setPlaying(false);
            return e;
          }
        }
        return e + 0.1;
      });
    }, 100);
    router.push(SCRIPT[0].route);
    return () => clearInterval(interval);
  }, [playing, stepIdx, router]);

  const currentStep = SCRIPT[stepIdx];
  const progress = (elapsed / currentStep.duration) * 100;

  function restart() {
    setStepIdx(0); setElapsed(0); setPlaying(true); router.push(SCRIPT[0].route);
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(720px,calc(100vw-3rem))]">
      <div className="glass rounded-2xl p-5 shadow-2xl shadow-black/50 border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-surface to-cyan-500/10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              Step {stepIdx + 1}/{SCRIPT.length}
            </span>
            <span className="text-sm font-semibold text-white">{currentStep.title}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setPlaying(p => !p)} className="p-2 rounded-lg bg-surface border border-border hover:border-indigo-500 text-gray-300 hover:text-white transition">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={() => { setStepIdx(Math.min(stepIdx + 1, SCRIPT.length - 1)); setElapsed(0); router.push(SCRIPT[Math.min(stepIdx + 1, SCRIPT.length - 1)].route); }} className="p-2 rounded-lg bg-surface border border-border hover:border-indigo-500 text-gray-300 hover:text-white transition">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={restart} className="p-2 rounded-lg bg-surface border border-border hover:border-indigo-500 text-gray-300 hover:text-white transition">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed mb-3">{currentStep.narration}</p>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
          <span>{elapsed.toFixed(1)}s</span>
          <span>~{(SCRIPT.reduce((s, st) => s + st.duration, 0)).toFixed(0)}s total</span>
        </div>
      </div>
    </div>
  );
}
