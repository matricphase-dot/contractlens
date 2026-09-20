# LinkedIn Streak Posts — Agentic AI Hackathon '26

Copy-paste these. Tag @Product Space. Upload a screenshot of the dashboard or upload flow.

---

## Day 1 Post (Sept 19 — post after kickoff / evening wrap)

🚀 Day 1 of the Agentic AI Hackathon by Product Space — I picked my problem and built the core of something I actually wish existed.

I'm building **ContractLens** — an AI agent that doesn't just summarize contracts, it WATCHES THEM for you.

Why? Because every business has a folder full of contracts and nobody remembers:
→ When the auto-renewal opt-out window closes
→ Which clauses are way below market standard
→ That two contracts renew 3 days apart and legal is going to drown
→ Whether the "mutual indemnity" clause is actually capped
→ What email you should send to push back on a one-sided term

Most "AI contract tools" are just PDF highlighters. That's not an agent. An agent PERCEIVES → REASONS → ACTS → MONITORS.

What I shipped today:
✅ Multi-stage analysis pipeline you can watch LIVE — Parse → Extract → Classify → Benchmark → Scan → Plan → Monitor
✅ Contract Health Score (0-100) with a circular gauge — instantly tells you if a contract is good/fair/risky
✅ Market benchmarking that compares your clauses against 2,400+ real contracts ("Net-15? Market is Net-30.")
✅ Cross-contract conflict detection — clustered renewals, jurisdiction fragmentation, payment concentration
✅ Risk flags with plain-English explanations AND concrete recommendations (not just "this is risky")
✅ Dark glassmorphism UI with Next.js 16, Tailwind v4, Vercel AI SDK, GPT-4o-mini with Zod-structured outputs
✅ Works offline in demo mode so any judge can kick the tires without API keys

Tomorrow is where the agent actually DOES things: drafting emails, building negotiation playbooks, calendarizing deadlines, answering natural-language questions with source citations, and version redlining.

Why this matters: information is cheap. Action is expensive. The winning AI tools won't be the ones that tell you what's in a document — they'll be the ones that tell you what to DO about it and hand you the draft.

Let's build. 🔥

#AgenticAIHackathon #ProductSpace #AI #BuildInPublic #AgenticAI #LegalTech

---

## Day 2 Post (Sept 20 — submission day)

✅ Submitted. ContractLens is shipped end-to-end, and it does things I didn't think were possible in 48 hours solo.

What the agent actually DOES (not just says):

🔹 Scores every contract 0-100 based on risk flags, market deviations, completeness
🔹 Benchmarks clauses against market standard ("Your 90-day termination clause is longer than 82% of SaaS MSAs under $250K")
🔹 Detects CROSS-CONTRACT conflicts (clustered renewals, cash-flow crunches, fragmented jurisdictions)
🔹 Flags risky clauses with severity, plain-English explanation, AND a concrete recommendation
🔹 PROPOSES ACTIONS with one-click execution:
  • Draft a vendor clarification email with all flagged points
  • Generate a full negotiation playbook with leverage, fallback, concession plan, opening lines
  • Calendar renewal deadlines with 90/60/30-day reminders
  • Write a memo to counsel prioritizing the riskiest items
  • Generate a one-page finance summary for AP
🔹 Answers natural-language questions with source citations back to section & page
🔹 Redlines version diffs with high/medium/low impact ratings
🔹 Lets you check off obligations as you complete them and updates state
🔹 Shows a visible reasoning trace so you can audit every agent decision
🔹 Monitors deadlines 24/7 with urgency tiers and a live "Agent Active" heartbeat

My favorite agentic moment was wiring up the upload flow — you watch the agent move through 7 distinct stages in real time, each one lighting up as it completes. No black box. You can see it think.

And the cross-contract conflict detector? Upload two contracts that renew within 30 days of each other and it flags the concentrated workload BEFORE you miss both windows. That's the kind of reasoning you only get when an agent looks at the WHOLE portfolio, not one document at a time.

Built with: Next.js 16, React 19, TypeScript, Tailwind v4, Vercel AI SDK, GPT-4o-mini with Zod-structured outputs. Fully functional offline demo mode.

3-min demo video submitted. Genuinely proud of this one 🤞

Shoutout to Product Space for running a tight hackathon — this pushed me. If you've ever gotten trapped by an auto-renewal you didn't see coming, tell me your horror story in the comments. I'd love to hear what features people actually want.

#AgenticAIHackathon #ProductSpace #AI #BuildInPublic #AgenticAI #LegalTech #AIAgents
