"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Shield, Zap, AlertTriangle, DollarSign, Eye, ArrowRight, Check,
  Sparkles, Layers, ChevronRight, Bot, TrendingUp, FileSearch
} from "lucide-react";
const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
);

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-gray-200 overflow-x-hidden">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-bg/80 backdrop-blur-lg border-b border-border" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">ContractLens</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="https://github.com/matricphase-dot/contractlens" target="_blank" className="text-sm text-gray-400 hover:text-white transition inline-flex items-center gap-1.5">
              <GithubIcon /> GitHub
            </Link>
            <Link href="/app" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/20 inline-flex items-center gap-1.5">
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
            <Bot className="w-3 h-3" /> Built for the Agentic AI Hackathon '26
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Your contracts are <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">watching you back</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8 leading-relaxed">
            ContractLens is an AI agent that finds what's missing in your contracts, shows you what it costs you, and hands you the exact fix. Auto-renewals, uncapped liability, missing clauses, forgotten deadlines — quantified, prioritized, and acted on in seconds.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/app" className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/30 inline-flex items-center gap-2 text-base">
              Open the agent <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how" className="px-6 py-3.5 rounded-xl bg-surface border border-border hover:border-indigo-500 text-white transition text-base">See how it works</a>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400" /> No signup required</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400" /> Free forever (demo)</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400" /> All citations auditable</span>
          </div>
        </div>
      </section>

      {/* Pain */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-3">The problem</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contracts don't lose you money because they're hard to read.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">They lose you money because of four silent failures that happen AFTER everyone signs.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <PainCard icon={<AlertTriangle className="w-6 h-6" />} title="$9B/year wasted" stat="62%" statLabel="of SaaS customers auto-renew without evaluating" color="red" />
            <PainCard icon={<Eye className="w-6 h-6" />} title="Blind spots" stat="14 clauses" statLabel="missing in the average SMB contract" color="orange" />
            <PainCard icon={<DollarSign className="w-6 h-6" />} title="Invisible costs" stat="$400/hr" statLabel="for a lawyer to find what AI finds in 2 seconds" color="yellow" />
            <PainCard icon={<ClockIcon />} title="Missed deadlines" stat="45 days" statLabel="average time between realizing you missed an opt-out and getting billed" color="indigo" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3">How it works</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">An agent that acts, not just summarizes</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Other tools tell you what's in a contract. ContractLens tells you what's MISSING, what it costs, and what to DO about it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<DollarSign className="w-6 h-6" />}
              color="red"
              title="$$ at Risk"
              desc="Every risky clause comes with a quantified dollar exposure. Auto-renewal? $150K lock-in. Uncapped indemnity? $500K worst case. You don't fix what you don't measure."
            />
            <FeatureCard
              icon={<Eye className="w-6 h-6" />}
              color="purple"
              title="Blind Spot Radar"
              desc="Scans against a 14-clause checklist for your contract type and finds MISSING clauses — data breach notification, DPAs, force majeure. This is what lawyers charge $400/hr to catch."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              color="cyan"
              title="Market Benchmarking"
              desc="Compares each clause against 2,400+ real contracts. 'Net-15 is tighter than market (68% are Net-30).' Negotiation ammo you can actually use."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              color="emerald"
              title="Action Center"
              desc="One-click generation of negotiation playbooks with counter-clause language, vendor emails, calendar reminders, finance summaries, and counsel memos. Ready to copy-paste-send."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              color="indigo"
              title="Cross-Contract Intelligence"
              desc="Looks across your whole portfolio to find clustered renewals, payment concentration, fragmented jurisdictions, and regulatory gaps no single document review catches."
            />
            <FeatureCard
              icon={<FileSearch className="w-6 h-6" />}
              color="orange"
              title="Natural-Language QA + Citations"
              desc="Ask 'What's my exposure?' or 'What clauses are missing?' and get answers grounded in source sections and page numbers. No hand-wavy AI claims."
            />
          </div>
        </div>
      </section>

      {/* Product mockup */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Built for humans who don't read 40 pages of legalese</h2>
            <p className="text-gray-400">Every feature ties back to one question: what is the user going to DO next?</p>
          </div>
          <div className="glass rounded-2xl p-2 shadow-2xl shadow-indigo-500/10 border-indigo-500/20">
            <div className="rounded-xl overflow-hidden bg-surface">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 text-center text-xs text-gray-500 font-mono">contractlens.ai/app</div>
              </div>
              <div className="grid md:grid-cols-[220px_1fr] min-h-[400px]">
                <div className="border-r border-border p-3 hidden md:block">
                  <div className="flex items-center gap-2 mb-5 mt-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500" />
                    <div>
                      <div className="text-sm font-bold text-white">ContractLens</div>
                      <div className="text-[9px] text-gray-500 uppercase">AI Intel</div>
                    </div>
                  </div>
                  {["Dashboard", "Upload Contracts", "All Contracts", "Timeline", "Ask Contracts", "Compare"].map((l, i) => (
                    <div key={l} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-1 ${i===0 ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 text-white border border-indigo-500/30" : "text-gray-500"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i===0?"bg-indigo-400":"bg-gray-600"}`} />
                      {l}
                    </div>
                  ))}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-full relative">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="#1f2937" strokeWidth="8" fill="none"/>
                        <circle cx="50" cy="50" r="42" stroke="#ef4444" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(49/100)*264} 264`}/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-red-400">49</div>
                    </div>
                    <div>
                      <div className="text-xs text-red-400 uppercase font-semibold mb-1">Quantified downside exposure</div>
                      <div className="text-3xl font-bold text-white">$789,500</div>
                      <div className="text-xs text-gray-500">across 5 scenarios on this contract</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      {l:"Auto-renewal lock-in", v:"$150,000", c:"red"},
                      {l:"Uncapped indemnification", v:"$500,000", c:"red"},
                      {l:"Late payment (annualized)", v:"$27,000", c:"yellow"},
                      {l:"Early termination cost", v:"$37,500", c:"yellow"},
                      {l:"Custom IP re-engineering", v:"$75,000", c:"yellow"},
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2/40 border border-border/50">
                        <div className={`w-2 h-2 rounded-full ${r.c==="red"?"bg-red-400":"bg-yellow-400"}`} />
                        <div className="flex-1 text-xs text-gray-300">{r.l}</div>
                        <div className={`text-xs font-bold ${r.c==="red"?"text-red-400":"text-yellow-400"}`}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium inline-flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Run Negotiation Playbook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">Stop getting surprised by your contracts.</h2>
          <p className="text-gray-400 text-lg mb-8">Upload your first contract in 10 seconds. Free. No signup. No credit card.</p>
          <Link href="/app" className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition shadow-xl shadow-indigo-500/30 inline-flex items-center gap-2 text-lg">
            Open ContractLens <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-gray-600 mt-4">Built in 48 hours for the Product Space Agentic AI Hackathon '26</p>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-border text-center text-xs text-gray-600">
        © 2026 ContractLens · Built with Next.js, Vercel AI SDK, GPT-4o-mini
      </footer>
    </div>
  );
}

function ClockIcon() { return <ClockSvg />; }
function ClockSvg() { return (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
); }

function PainCard({ icon, title, stat, statLabel, color }: any) {
  const colors: any = {
    red: "from-red-500/20 to-red-500/5 text-red-400 border-red-500/30",
    orange: "from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/30",
    yellow: "from-yellow-500/20 to-yellow-500/5 text-yellow-400 border-yellow-500/30",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30",
  };
  return (
    <div className="glass rounded-xl p-5">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} border flex items-center justify-center mb-4`}>{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{stat}</div>
      <div className="text-xs text-gray-500 mb-3">{statLabel}</div>
      <div className="text-sm text-gray-300 font-medium">{title}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: any) {
  const colors: any = {
    red: "text-red-400 bg-red-500/10 border-red-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  };
  return (
    <div className="glass rounded-xl p-6 hover:border-indigo-500/30 transition group">
      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${colors[color]} border flex items-center justify-center mb-4`}>{icon}</div>
      <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-indigo-300 transition">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
