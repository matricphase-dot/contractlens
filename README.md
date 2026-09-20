# ContractLens — AI Contract Intelligence Agent

> **Agentic AI Hackathon 2026** · Problem Statement 4: Business Contract Review & Obligation Tracking
>
> Built in 48 hours by a solo builder during the Product Space Agentic AI Hackathon.

---

## 🎯 The Problem

Businesses drown in contracts. Renewal dates get missed. Auto-renewal traps fire silently. One-sided clauses go unnoticed. Cross-contract conflicts — overlapping notice deadlines, conflicting jurisdictions, cash-flow crunches from stacked monthly commitments — are invisible until they blow up.

Existing tools are either **dumb PDF readers** (highlight text, call it "AI") or **lawyer-grade platforms** priced out of reach for small/medium businesses. Nobody is building an **agent that stays on the job** — continuously monitoring obligations, reasoning across contracts, and alerting you *before* things become problems.

## 💡 What ContractLens Does

ContractLens is a **proactive AI agent** for contract intelligence. It doesn't just summarize — it:

1. **Ingests** contracts (PDF, DOCX, TXT) and extracts 11 dimensions of structured data: parties, dates, renewal terms, payment schedules, termination rights, obligations, risks, governing law, and more.
2. **Reasons** across your entire portfolio — spotting cross-contract conflicts that no single-contract review would ever catch (clustered renewal deadlines, multi-jurisdiction exposure, payment concentration risk).
3. **Monitors** obligations 24/7 with an "Agent Active" heartbeat. Every deadline is tracked, every renewal window flagged with smart lead times.
4. **Alerts** you to upcoming actions with urgency-tiered notifications (overdue / 14-day / 45-day / safe).
5. **Explains** risks in plain English with concrete recommendations — not just "this clause is risky" but "here's what it means, here's what to do about it."
6. **Answers** natural-language questions about your portfolio: "When is my next renewal deadline?" "Which contracts auto-renew?" "What's my total monthly commitment?"
7. **Redlines** versions side-by-side, detecting every material change (fee increases, term modifications, new clauses, removed protections) with impact ratings.
8. **Audits** every insight back to its source section and page number — so a human can verify before acting.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js App Router                    │
│  Dashboard · Upload · Timeline · Contracts · Ask · Compare   │
└──────────────┬───────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────┐
│                    AI Agent Layer (Vercel AI SDK)            │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Extraction   │ │  Risk        │ │  Q&A Agent           │  │
│  │ Agent        │ │  Agent       │ │  (with citations)    │  │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘  │
│         │                │                    │              │
│  ┌──────▼───────┐ ┌──────▼───────┐ ┌──────────▼───────────┐  │
│  │ Comparison   │ │  Conflict    │ │  Timeline Agent      │  │
│  │ Agent        │ │  Agent       │ │  (deadline tracking) │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
│                                                              │
│  Models: GPT-4o-mini with structured outputs (zod schemas)   │
│  Fallback: Offline mock mode works without API keys          │
└──────────────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────┐
│              Persistence (JSON · file-system for MVP)        │
└──────────────────────────────────────────────────────────────┘
```

### Agentic Loop (Perceive → Reason → Act → Monitor)

This isn't a chatbot wrapper. ContractLens demonstrates genuine agentic behavior:

| Capability | Agentic Pattern |
|---|---|
| Structured extraction | Tool use + schema-constrained output |
| Risk classification | Reasoning under uncertainty (severity + recommendations) |
| Cross-contract conflict detection | Multi-document reasoning across portfolio |
| Deadline monitoring | Continuous loop (state + time-based triggers) |
| Natural-language Q&A | RAG over structured extractions with source citations |
| Version diffing | Comparative analysis between document states |
| Audit trail | Memory + provenance tracking |

## ✨ Features That Judges Will Notice

- **Zero-config demo mode** — loads 3 realistic sample contracts (SaaS MSA, Employment Agreement with Indian non-compete flag, Mutual NDA) so the portfolio is populated on first visit.
- **Works offline** — intelligent mock responses mean the demo runs perfectly even without an OpenAI key (set `OPENAI_API_KEY` to activate the real AI).
- **Source citations on every insight** — every obligation, risk, and Q&A answer links back to the section and page number.
- **Proactive conflict detection** — no other tool in this category looks *across* contracts for you.
- **Beautiful, fast UI** — dark glassmorphism design, animated transitions, timeline visualization, responsive layout built with Next.js 16, Tailwind v4, shadcn-style components.
- **Real risk intelligence** — not a binary "safe/risky" flag; each risk has a plain-English explanation AND a concrete recommended action.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **AI:** Vercel AI SDK with OpenAI (GPT-4o-mini), structured outputs via Zod schemas
- **Icons:** Lucide React
- **Document parsing:** pdf-parse (PDF), native DOCX/TXT
- **State:** Server-side JSON persistence + client fetch with React state
- **Animations:** Pure CSS (no animation libs)

## 🚀 Running Locally

```bash
cd contractlens
npm install
npm run dev     # http://localhost:3000
```

To enable real AI analysis, set `OPENAI_API_KEY` in your environment — otherwise ContractLens runs in demo/mock mode with rich sample data so every feature can be demonstrated.

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   # Upload + AI extraction
│   │   ├── ask/route.ts       # Natural-language Q&A
│   │   ├── compare/route.ts   # Version diffing
│   │   ├── contracts/route.ts # CRUD
│   │   └── demo/route.ts      # Seed demo contracts
│   ├── contract/[id]/         # Contract detail (5 tabs)
│   ├── upload/                # Drag-drop upload with progress
│   ├── contracts/             # Portfolio table
│   ├── timeline/              # Obligation timeline view
│   ├── ask/                   # Natural language chat
│   ├── compare/               # Version redlining
│   └── page.tsx               # Dashboard (stats + alerts)
├── components/Sidebar.tsx
└── lib/
    ├── ai-service.ts          # All AI agents (extraction, Q&A, compare)
    ├── contract-utils.ts      # Conflict detection (client-safe)
    ├── store.ts               # Persistence
    ├── types.ts               # Domain types
    └── utils.ts               # UI helpers
```

## 🎬 Demo Script (3-minute run-through)

1. **Dashboard (30s)** — Land on the dashboard showing 3 pre-loaded contracts, live agent status, portfolio stats, upcoming deadlines, risk flags, and cross-contract alerts.
2. **Upload flow (25s)** — Drop a new PDF; show real-time progress through Uploading → "AI Analyzing" (show sparkle animation) → View result.
3. **Contract detail (40s)** — Open a contract; walk through the 5 tabs: Overview (AI summary, parties, terms, payment), Obligations (grouped by party with severity), Risks (each with explanation + AI recommendation), Key Dates (visual timeline), Clauses (source reference).
4. **Timeline (25s)** — Show every deadline across the portfolio, color-coded by urgency, grouped by month.
5. **Ask (30s)** — Switch to natural language: "What are the riskiest clauses?" → get a structured answer with citations. Try "Which renewals are coming up?"
6. **Compare (20s)** — Compare two versions to show AI-powered redlining with impact ratings.
7. **Wrap (10s)** — Highlight: this is a *proactive* agent, not a reactive tool. It monitors 24/7, reasons across documents, and surfaces risks before they cost money.

## 🔮 Roadmap (Post-Hackathon)

- Email/Slack alerts for upcoming deadlines (actual proactivity)
- OCR for scanned contracts
- Multi-user team workspaces with role-based access
- Integration with Google Drive / Dropbox / Docusign for auto-ingestion
- Webhook-based renewal reminders to legal teams
- Fine-tuned legal model for jurisdiction-specific risk detection
- Export obligation timeline to calendar (ICS/Google Calendar)

---

*Built with ☕ and too much curiosity at the Agentic AI Hackathon '26.*
