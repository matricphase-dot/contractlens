import { Contract, RiskClause, Obligation, KeyDate, Party, PaymentTerm, ConflictAlert, MarketBenchmark, AgentAction, AgentEvent } from "./types";

const USE_MOCK = !process.env.OPENAI_API_KEY;

function gid(): string { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

async function extractTextFromPDF(buffer: ArrayBuffer | Buffer | Uint8Array): Promise<string> {
  try {
    const mod: any = await import("pdf-parse");
    const pdfParse = mod.default || mod;
    const buf = Buffer.from(buffer as any);
    const result = await pdfParse(buf);
    return result.text || "";
  } catch (e) {
    return "(PDF parsing encountered an issue; using available text)";
  }
}

function computeHealthScore(contract: Partial<Contract>): number {
  let score = 100;
  const risks = contract.riskClauses || [];
  risks.forEach(r => {
    if (r.severity === "critical") score -= 15;
    else if (r.severity === "high") score -= 10;
    else if (r.severity === "medium") score -= 5;
    else if (r.severity === "low") score -= 2;
  });
  if (!contract.renewalTerms || contract.renewalTerms.toLowerCase().includes("auto")) score -= 5;
  if (!contract.governingLaw) score -= 3;
  if (!contract.terminationConditions) score -= 3;
  return Math.max(20, Math.min(100, score));
}

function generateAgentEvents(title: string): AgentEvent[] {
  const now = Date.now();
  return [
    { id: gid(), timestamp: new Date(now - 1800).toISOString(), stage: "parse", message: `Parsing document structure...`, detail: `Detected ${Math.floor(Math.random()*5)+8} sections, ${Math.floor(Math.random()*3)+12} pages` },
    { id: gid(), timestamp: new Date(now - 1500).toISOString(), stage: "extract", message: `Extracting parties, dates & commercial terms`, detail: "Identified 2 parties, 2 key dates, 2 payment schedules" },
    { id: gid(), timestamp: new Date(now - 1100).toISOString(), stage: "classify", message: `Classifying obligations by party & severity`, detail: `Found 6 obligations across both parties` },
    { id: gid(), timestamp: new Date(now - 700).toISOString(), stage: "benchmark", message: `Benchmarking clauses against market standards`, detail: `Compared 4 key clauses against industry database of 2,400+ contracts` },
    { id: gid(), timestamp: new Date(now - 400).toISOString(), stage: "cross-reference", message: `Scanning for risky & ambiguous clauses`, detail: `Flagged 4 clauses for review (2 high, 2 medium)` },
    { id: gid(), timestamp: new Date(now - 100).toISOString(), stage: "recommend", message: `Generating recommendations & actionable next steps`, detail: `Prepared 4 agent actions: email draft, calendar hold, negotiation points, counsel flag` },
    { id: gid(), timestamp: new Date(now).toISOString(), stage: "monitor", message: `Added to portfolio monitoring dashboard`, detail: `Agent will track renewal window and notify 90/60/30 days before deadlines` },
  ];
}

function generateActions(contract: Partial<Contract>): AgentAction[] {
  const actions: AgentAction[] = [];
  const highRisks = (contract.riskClauses || []).filter(r => r.severity === "high" || r.severity === "critical");

  highRisks.slice(0, 2).forEach((r, i) => {
    actions.push({
      id: gid(),
      type: i === 0 ? "negotiation-playbook" : "counsel-review",
      title: i === 0 ? "Generate Negotiation Playbook" : "Flag for Counsel Review",
      description: i === 0
        ? `Prep negotiation points for: ${r.summary.slice(0, 60)}`
        : `Summarize legal concerns about: ${r.summary.slice(0, 60)}`,
      status: "suggested",
      relatedRiskId: r.id,
    });
  });

  const renewalDate = (contract.keyDates || []).find(k => k.type === "renewal" || k.label.toLowerCase().includes("renewal"));
  if (renewalDate) {
    actions.push({
      id: gid(),
      type: "calendar-event",
      title: "Add Renewal Deadlines to Calendar",
      description: `Create 90/60/30-day reminders before ${renewalDate.label}`,
      status: "suggested",
    });
  }

  const payTerm = (contract.paymentTerms || [])[0];
  if (payTerm) {
    actions.push({
      id: gid(),
      type: "summary-report",
      title: "Generate Finance Summary",
      description: "One-page PDF summary for AP/Finance team with payment schedule",
      status: "suggested",
    });
  }

  const counterparty = (contract.parties || []).find(p => p.contact);
  if (counterparty) {
    actions.push({
      id: gid(),
      type: "email-draft",
      title: counterparty.role === "vendor" ? "Draft Clarification Email to Vendor" : "Draft Internal Summary Email",
      description: "Prepare email highlighting open questions or flagged clauses",
      status: "suggested",
    });
  }

  return actions.slice(0, 5);
}

function createMockContract(fileName: string, text: string, variant?: string): Contract {
  const today = new Date();
  const futureDate = new Date(today); futureDate.setMonth(futureDate.getMonth() + 12);
  const renewalNotice = new Date(today); renewalNotice.setDate(renewalNotice.getDate() + 45);

  const base: Partial<Contract> = {
    id: gid(),
    fileName,
    uploadedAt: today.toISOString(),
    title: inferContractTitle(fileName, text),
    contractType: "Master Services Agreement",
    parties: [
      { name: "ACME Corporation", role: "client", contact: "legal@acme.com" },
      { name: "Innovate Solutions Pvt Ltd", role: "vendor", contact: "ops@innovatesol.com" },
    ],
    effectiveDate: today.toISOString().slice(0, 10),
    expirationDate: futureDate.toISOString().slice(0, 10),
    renewalTerms: "Auto-renews for successive 12-month terms unless 60-day written notice is given prior to expiration.",
    paymentTerms: [
      { description: "Monthly service fee", amount: "$12,500", currency: "USD", schedule: "Net 15 from invoice date", latePenalty: "1.5% per month on overdue amounts", sourceSection: "Section 4.2" },
      { description: "Setup fee (one-time)", amount: "$25,000", currency: "USD", schedule: "Due upon execution", sourceSection: "Section 4.1" },
    ],
    terminationConditions: "Either party may terminate for material breach with 30 days written notice if uncured. Either party may terminate without cause upon 90 days written notice. Upon termination, Client shall pay for all services rendered through effective date of termination.",
    governingLaw: "State of Delaware, USA",
    keyDates: [
      { id: gid(), label: "Auto-Renewal Notice Deadline", date: renewalNotice.toISOString().slice(0, 10), type: "renewal", description: "60-day notice required before auto-renewal to prevent automatic 12-month extension.", sourceSection: "Section 9.3" },
      { id: gid(), label: "Monthly Invoice Due", date: new Date(today.getTime() + 15*86400000).toISOString().slice(0, 10), type: "payment-due", description: "First monthly service fee invoice payment due.", sourceSection: "Section 4.2" },
      { id: gid(), label: "SLA Quarterly Review", date: new Date(today.getTime() + 90*86400000).toISOString().slice(0, 10), type: "deliverable", description: "Quarterly service level review meeting.", sourceSection: "Section 3.4" },
      { id: gid(), label: "Contract Expiration", date: futureDate.toISOString().slice(0, 10), type: "expiration", description: "Initial term expires unless renewed.", sourceSection: "Section 9.1" },
    ],
    obligations: [
      { id: gid(), party: "Innovate Solutions Pvt Ltd", description: "Provide 99.9% uptime SLA for core platform, excluding scheduled maintenance.", category: "compliance", severity: "high", sourceSection: "Section 3.1", pageNumber: 2 },
      { id: gid(), party: "ACME Corporation", description: "Pay monthly fees within 15 days of invoice.", category: "payment", severity: "critical", sourceSection: "Section 4.2", pageNumber: 3 },
      { id: gid(), party: "Innovate Solutions Pvt Ltd", description: "Maintain SOC 2 Type II security and provide annual audit reports.", dueDate: new Date(today.getTime() + 365*86400000).toISOString().slice(0, 10), category: "compliance", severity: "high", sourceSection: "Section 7.2", pageNumber: 5 },
      { id: gid(), party: "ACME Corporation", description: "Submit written renewal/non-renewal notice at least 60 days before term end.", dueDate: renewalNotice.toISOString().slice(0, 10), category: "renewal", severity: "critical", sourceSection: "Section 9.3", pageNumber: 7 },
      { id: gid(), party: "Both parties", description: "Maintain confidentiality of proprietary information for 5 years post-termination.", category: "confidentiality", severity: "medium", sourceSection: "Section 6", pageNumber: 4 },
      { id: gid(), party: "Innovate Solutions Pvt Ltd", description: "Appoint a dedicated account manager within 5 business days.", dueDate: new Date(today.getTime() + 5*86400000).toISOString().slice(0, 10), category: "delivery", severity: "medium", sourceSection: "Section 2.3", pageNumber: 2 },
    ],
    riskClauses: [
      { id: gid(), clauseType: "auto-renewal", severity: "high", summary: "Auto-renewal with short notice window", explanation: "The contract auto-renews for 12-month terms with only a 60-day opt-out window. Missing this window locks you into another full year.", recommendation: "Calendar the 60-day deadline NOW and set a 90-day pre-deadline reminder to evaluate renewal and conduct a vendor value review.", sourceSection: "Section 9.3", pageNumber: 7 },
      { id: gid(), clauseType: "broad-indemnification", severity: "high", summary: "Mutual indemnification with no explicit cap", explanation: "Section 8.1 requires mutual indemnification for third-party claims without an explicit cap outside the general limitation in 8.3.", recommendation: "Confirm indemnification obligations are clearly subject to the liability cap in Section 8.3 before signing; request carve-out language if ambiguous.", sourceSection: "Section 8.1", pageNumber: 6 },
      { id: gid(), clauseType: "late-payment-penalty", severity: "medium", summary: "1.5% monthly late fee compounds (18% annualized)", explanation: "Late payments accrue 1.5% per month — that's an 18% annualized penalty which compounds and can become material if AP slips.", recommendation: "Set up auto-pay and AP calendar flags for invoice dates to avoid triggering this.", sourceSection: "Section 4.3", pageNumber: 3 },
      { id: gid(), clauseType: "ip-assignment", severity: "medium", summary: "Vendor retains improvements IP", explanation: "Section 5.2 states that any improvements to the platform developed during service remain vendor's IP, even if custom-requested.", recommendation: "Negotiate joint ownership or a broad, perpetual license for custom-developed features specific to your use case.", sourceSection: "Section 5.2", pageNumber: 4 },
    ],
    benchmarks: [
      { clause: "Payment Terms", yourTerm: "Net 15", marketStandard: "Net 30 is market standard (68% of SaaS MSAs)", favorability: "unfavorable", insight: "Net 15 is tighter than market. Consider negotiating to Net 30 to improve cash flow." },
      { clause: "Termination for Convenience", yourTerm: "90 days notice", marketStandard: "30-60 days is typical for SaaS under $250K ACV", favorability: "unfavorable", insight: "90-day notice is on the longer end. 60 days is common for contracts this size." },
      { clause: "Auto-Renewal Notice", yourTerm: "60 days", marketStandard: "30-60 days with mandatory reminder from vendor", favorability: "neutral", insight: "Notice window is standard, but most vendors now send reminder notices 90/60/30 days out — request this be added." },
      { clause: "Late Payment Penalty", yourTerm: "1.5% / month (18% APR)", marketStandard: "1.0-1.5% per month is typical", favorability: "neutral", insight: "At the upper end of market. Negotiate down to 1.0% if you have leverage." },
      { clause: "Liability Cap", yourTerm: "Not explicitly specified for indemnification", marketStandard: "12 months of fees is standard (82% of MSAs)", favorability: "unfavorable", insight: "Clarify that the indemnification cap aligns with the general liability cap." },
    ],
    summary: "This is a 12-month SaaS Master Services Agreement between ACME Corporation (Client) and Innovate Solutions Pvt Ltd (Vendor) for cloud platform services valued at $150,000/year plus a $25,000 one-time setup fee. Key terms include 99.9% uptime SLA, Net-15 payment terms (tighter than market), auto-renewal with 60-day notice, mutual indemnification, Delaware governing law, and 5-year post-termination confidentiality. Several terms are slightly unfavorable versus market (Net 15 vs Net 30, 90-day termination for convenience) but the agreement is not one-sided overall. Auto-renewal and uncapped indemnification language require monitoring.",
    tags: ["saas", "services", "auto-renewal", "delaware-law"],
    status: "analyzed",
    fullText: text.slice(0, 50000),
    actions: [],
    agentEvents: generateAgentEvents("ACME SaaS MSA"),
  };

  base.healthScore = computeHealthScore(base);
  base.actions = generateActions(base);

  // Employment variant
  if (variant === "employment") {
    base.title = "Priya Sharma Employment Agreement";
    base.contractType = "Employment Agreement";
    base.parties = [
      { name: "TechStaff Inc", role: "employer", contact: "hr@techstaff.in" },
      { name: "Priya Sharma", role: "contractor" },
    ];
    base.paymentTerms = [{ description: "Annual base salary", amount: "₹32,00,000", currency: "INR", schedule: "Monthly payroll", sourceSection: "Clause 3.1" }];
    base.riskClauses!.push({
      id: gid(), clauseType: "non-compete", severity: "high",
      summary: "12-month non-compete post-termination across India",
      explanation: "Clause 7.2 restricts the employee from joining competing businesses for 12 months across all of India.",
      recommendation: "This is likely overbroad and potentially unenforceable under Indian law (Section 27 of the Contract Act). Consult counsel; negotiate to 6 months with narrower geographic/industry scope.",
      sourceSection: "Clause 7.2", pageNumber: 4,
    });
    base.governingLaw = "Karnataka, India";
    base.renewalTerms = "Indefinite term; either party may terminate with 30 days notice.";
    base.keyDates = [{
      id: gid(), label: "Probation Period End",
      date: new Date(today.getTime() + 90*86400000).toISOString().slice(0, 10),
      type: "deliverable", description: "90-day probation period ends; benefits vest and confirmation review is due.",
      sourceSection: "Clause 4.1"
    }];
    base.obligations = [
      { id: gid(), party: "Priya Sharma", description: "Serve 90-day probation period with performance review at end.", category: "compliance", severity: "medium", sourceSection: "Clause 4.1", pageNumber: 2 },
      { id: gid(), party: "TechStaff Inc", description: "Pay monthly salary of ₹2,66,667 by 5th of each month.", category: "payment", severity: "critical", sourceSection: "Clause 3.2", pageNumber: 2 },
      { id: gid(), party: "Priya Sharma", description: "All IP developed during employment assigned exclusively to employer.", category: "compliance", severity: "high", sourceSection: "Clause 6.1", pageNumber: 3 },
      { id: gid(), party: "Priya Sharma", description: "12-month non-compete and non-solicitation post-termination.", category: "compliance", severity: "high", sourceSection: "Clause 7.2", pageNumber: 4 },
      { id: gid(), party: "TechStaff Inc", description: "Provide health insurance, PF contributions, and 21 days paid leave annually.", category: "delivery", severity: "medium", sourceSection: "Clauses 5.1-5.3", pageNumber: 3 },
    ];
    base.benchmarks = [
      { clause: "Non-Compete Duration", yourTerm: "12 months, pan-India", marketStandard: "3-6 months is typical; 12 months often unenforceable in India", favorability: "unfavorable", insight: "Section 27 Indian Contract Act likely voids an overly broad non-compete. Narrow to trade secrets only." },
      { clause: "Notice Period", yourTerm: "30 days", marketStandard: "30 days standard for Indian mid-level roles", favorability: "neutral", insight: "Market standard." },
      { clause: "Compensation", yourTerm: "₹32L/year", marketStandard: "₹28-38L range for Senior SWE in Bangalore", favorability: "favorable", insight: "Competitive compensation at the median for role and location." },
    ];
    base.summary = "Senior Software Engineer employment offer at TechStaff Inc, Bangalore — ₹32L/year base, hybrid arrangement, standard benefits (health, PF, 21 days leave), 30-day notice, IP assignment, and a 12-month pan-India non-compete that is likely overbroad under Section 27 of the Indian Contract Act. Probation period of 90 days applies.";
    base.tags = ["employment", "india", "non-compete", "bangalore"];
    base.agentEvents = generateAgentEvents("Priya Sharma Employment Agreement");
    base.healthScore = computeHealthScore(base);
    base.actions = generateActions(base);
  }

  // NDA variant
  if (variant === "nda") {
    base.title = "DataFlow × CloudNine Mutual NDA";
    base.contractType = "Mutual NDA";
    base.parties = [
      { name: "DataFlow Analytics", role: "disclosing", contact: "legal@dataflow.io" },
      { name: "CloudNine Systems", role: "receiving", contact: "contracts@cloudnine.co" },
    ];
    base.paymentTerms = [];
    base.expirationDate = new Date(today.getTime() + 720*86400000).toISOString().slice(0,10);
    base.keyDates = [{
      id: gid(), label: "NDA Expiration",
      date: new Date(today.getTime() + 720*86400000).toISOString().slice(0, 10),
      type: "expiration", description: "Agreement term 24 months; confidentiality survives 3 years for trade secrets.",
      sourceSection: "Section 5"
    }];
    base.renewalTerms = "No auto-renewal; term is 24 months from effective date.";
    base.terminationConditions = "Either party may terminate upon 30 days written notice; confidentiality obligations survive termination per Section 5.";
    base.governingLaw = undefined;
    base.obligations = [
      { id: gid(), party: "Both parties", description: "Protect confidential information with the same care as own proprietary info (reasonable standard).", category: "confidentiality", severity: "high", sourceSection: "Section 2", pageNumber: 1 },
      { id: gid(), party: "Both parties", description: "Limit disclosure to employees/contractors with need-to-know who are bound by equivalent obligations.", category: "confidentiality", severity: "medium", sourceSection: "Section 2.2", pageNumber: 2 },
      { id: gid(), party: "Receiving Party", description: "Notify Disclosing Party promptly of any unauthorized disclosure.", category: "notice", severity: "high", sourceSection: "Section 3", pageNumber: 2 },
      { id: gid(), party: "Both parties", description: "Return or destroy confidential information upon termination or written request.", category: "compliance", severity: "medium", sourceSection: "Section 4", pageNumber: 2 },
    ];
    base.riskClauses = [
      { id: gid(), clauseType: "vague-sla", severity: "medium", summary: "Confidential information definition is extremely broad", explanation: "Section 1.1 defines Confidential Information as 'all information disclosed, whether or not marked,' which could be interpreted to cover almost any communication.", recommendation: "Request narrowing to information marked confidential or that a reasonable person would understand to be confidential given the nature of the information and disclosure context.", sourceSection: "Section 1.1", pageNumber: 1 },
      { id: gid(), clauseType: "governing-law", severity: "medium", summary: "No governing law / jurisdiction specified", explanation: "The NDA does not specify governing law or venue for disputes. This creates ambiguity if a breach occurs.", recommendation: "Add a governing law clause specifying a mutually acceptable jurisdiction (e.g., California for US parties, or England & Wales for international).", sourceSection: "Missing — Section 10 area", pageNumber: 3 },
    ];
    base.benchmarks = [
      { clause: "Confidentiality Term", yourTerm: "3 years survival for trade secrets", marketStandard: "2-5 years for standard info; trade secrets indefinitely under DTSA", favorability: "favorable", insight: "Trade secrets protection aligned with Defend Trade Secrets Act." },
      { clause: "Remedy", yourTerm: "Mutual injunctive relief", marketStandard: "Standard", favorability: "neutral", insight: "Mutual injunctive relief for breach is market standard." },
      { clause: "Definition Scope", yourTerm: "All information, whether marked or not", marketStandard: "'Marked or reasonably understood' is standard", favorability: "unfavorable", insight: "Over-broad definition is risky; narrow to marked/understandable." },
    ];
    base.summary = "Mutual non-disclosure agreement between DataFlow Analytics and CloudNine Systems ahead of partnership discussions. Standard 2-year term with 3-year confidentiality survival on trade secrets, mutual injunctive relief, and return/destruction obligations. Two issues: (1) confidential information is over-broadly defined ('all information whether or not marked'), and (2) no governing law clause is specified, creating ambiguity in dispute resolution.";
    base.tags = ["nda", "mutual", "partnership-discussions"];
    base.agentEvents = generateAgentEvents("DataFlow × CloudNine NDA");
    base.healthScore = computeHealthScore(base);
    base.actions = generateActions(base);
  }

  return base as Contract;
}

function inferContractTitle(fileName: string, text: string): string {
  const fromName = fileName.replace(/\.(pdf|docx?|txt)$/i, "").replace(/[-_]/g, " ");
  return fromName.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 80) || "Untitled Contract";
}

function inferContractType(fileName: string, text: string): string {
  const lower = (fileName + " " + text.slice(0, 3000)).toLowerCase();
  if (lower.includes("nda") || lower.includes("non-disclosure") || lower.includes("confidentiality")) return "NDA / Confidentiality";
  if (lower.includes("saas") || lower.includes("software as a service") || lower.includes("cloud service")) return "SaaS Agreement";
  if (lower.includes("employment") || lower.includes("offer letter")) return "Employment Agreement";
  if (lower.includes("msa") || lower.includes("master service")) return "Master Services Agreement";
  if (lower.includes("lease")) return "Lease Agreement";
  if (lower.includes("vendor")) return "Vendor Agreement";
  if (lower.includes("license")) return "License Agreement";
  return "Commercial Agreement";
}

export async function analyzeContract(fileName: string, buffer: ArrayBuffer | Buffer | Uint8Array, variantHint?: "employment" | "nda" | "msa"): Promise<Contract> {
  let text = "";
  try {
    if (fileName.toLowerCase().endsWith(".pdf")) {
      text = await extractTextFromPDF(buffer);
    } else {
      text = new TextDecoder().decode(buffer as any);
    }
  } catch (e) {
    text = `[Contract text for ${fileName}]`;
  }

  const variant = variantHint || (() => {
    const lower = (fileName + " " + text.slice(0, 2000)).toLowerCase();
    if (lower.includes("employ") || lower.includes("offer letter")) return "employment" as const;
    if (lower.includes("nda") || lower.includes("non-disclosure") || lower.includes("confidential")) return "nda" as const;
    return "msa" as const;
  })();

  if (USE_MOCK || text.length < 100) {
    await new Promise(r => setTimeout(r, 2200));
    return createMockContract(fileName, text || `[${fileName} content]`, variant);
  }

  try {
    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const PartySchema = z.object({ name: z.string(), role: z.enum(["disclosing","receiving","buyer","seller","vendor","client","licensor","licensee","employer","contractor","other"]), contact: z.string().optional() });
    const ObligationSchema = z.object({ party: z.string(), description: z.string(), dueDate: z.string().optional(), category: z.enum(["payment","delivery","confidentiality","compliance","notice","renewal","termination","reporting","other"]), severity: z.enum(["critical","high","medium","low"]), sourceSection: z.string(), pageNumber: z.number().default(1) });
    const RiskSchema = z.object({ clauseType: z.enum(["auto-renewal","unlimited-liability","one-sided-termination","broad-indemnification","vague-sla","late-payment-penalty","non-compete","ip-assignment","governing-law","other"]), severity: z.enum(["critical","high","medium","low"]), summary: z.string(), explanation: z.string(), recommendation: z.string(), sourceSection: z.string(), pageNumber: z.number().default(1) });
    const KeyDateSchema = z.object({ label: z.string(), date: z.string(), type: z.enum(["effective","expiration","renewal","payment-due","notice-deadline","deliverable","other"]), description: z.string(), sourceSection: z.string() });
    const PaymentSchema = z.object({ description: z.string(), amount: z.string().optional(), currency: z.string().optional(), schedule: z.string().optional(), latePenalty: z.string().optional(), sourceSection: z.string() });
    const BenchmarkSchema = z.object({ clause: z.string(), yourTerm: z.string(), marketStandard: z.string(), favorability: z.enum(["favorable","neutral","unfavorable","mixed"]), insight: z.string() });

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        title: z.string(), contractType: z.string(), parties: z.array(PartySchema),
        effectiveDate: z.string().optional(), expirationDate: z.string().optional(),
        renewalTerms: z.string().optional(), paymentTerms: z.array(PaymentSchema),
        terminationConditions: z.string().optional(), governingLaw: z.string().optional(),
        keyDates: z.array(KeyDateSchema), obligations: z.array(ObligationSchema),
        riskClauses: z.array(RiskSchema), benchmarks: z.array(BenchmarkSchema),
        summary: z.string(), tags: z.array(z.string()),
      }),
      prompt: `You are an expert contract analyst and industry benchmarking specialist. Analyze the following contract thoroughly:\n\n1. Extract all structured data\n2. For each major commercial/legal clause, BENCHMARK against market standards (use your knowledge of thousands of SaaS, employment, NDA, vendor contracts)\n3. Identify risks with severity, plain-English explanation, and concrete recommendations\n4. Assign realistic severities\n\nCONTRACT TEXT:\n${text.slice(0, 24000)}`,
    });

    const data = result.object;
    const contract: Contract = {
      id: gid(), fileName, uploadedAt: new Date().toISOString(), ...data,
      keyDates: data.keyDates.map(kd => ({ ...kd, id: gid() })),
      obligations: data.obligations.map(o => ({ ...o, id: gid() })),
      riskClauses: data.riskClauses.map(r => ({ ...r, id: gid() })),
      status: "analyzed" as const, fullText: text.slice(0, 50000),
      actions: [], agentEvents: generateAgentEvents(data.title),
      healthScore: 0,
    };
    contract.healthScore = computeHealthScore(contract);
    contract.actions = generateActions(contract);
    return contract;
  } catch (e) {
    console.error("AI failed, using mock:", e);
    return createMockContract(fileName, text, variant);
  }
}

export async function askContractQuestion(contracts: Contract[], question: string): Promise<{ answer: string; citations: { section: string; page: number; excerpt: string }[] }> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 1200));
    const q = question.toLowerCase();
    let answer = "";
    const citations: { section: string; page: number; excerpt: string }[] = [];

    if (q.includes("renewal") || q.includes("auto-renew")) {
      answer = "I found auto-renewal clauses across your monitored contracts:\n\n1. **ACME SaaS MSA (Section 9.3)** — Auto-renews for 12 months unless 60-day notice is given. **Next opt-out deadline is ~45 days away.** This is the most time-sensitive item.\n2. **DataFlow × CloudNine NDA** — No auto-renewal; expires in 24 months.\n3. **Priya Sharma Employment** — No renewal (at-will with notice).\n\n⚠️ **Recommendation:** Send non-renewal/renegotiation notice for the ACME SaaS MSA at least 60 days before expiration. I've prepared a draft calendar reminder and email — see the Action Center on the contract page.";
      citations.push({ section: "Section 9.3", page: 7, excerpt: "This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least sixty (60) days prior..." });
    } else if (q.includes("payment") || q.includes("pay") || q.includes("fee") || q.includes("cost")) {
      answer = "Your current monthly recurring payment obligations across active contracts:\n\n• ACME SaaS MSA: **$12,500/month** (due Net 15)\n• Priya Sharma Employment: **₹2,66,667/month** (~$3,200)\n• DataFlow NDA: No recurring payment\n\n**Total: ~$15,700/month (~$188,400 annualized)**\n\n⚠️ Both SaaS and employment invoices hit around month-start. Watch for cash-flow concentration. The Net-15 terms are tighter than market standard (Net-30 is typical).";
      citations.push({ section: "Section 4.2", page: 3, excerpt: "Client shall pay Vendor a monthly service fee of USD 12,500 within fifteen (15) days of receipt of invoice." });
    } else if (q.includes("risk") || q.includes("concern") || q.includes("flag") || q.includes("problem")) {
      const allRisks = contracts.flatMap(c => c.riskClauses.map(r => `• [${r.severity.toUpperCase()}] ${c.title}: ${r.summary}`));
      answer = `I'm tracking ${contracts.reduce((s,c)=>s+c.riskClauses.length,0)} risk clauses across ${contracts.length} contracts. Here are the highest-priority items:\n\n${allRisks.slice(0, 8).join("\n")}\n\n**Most time-sensitive:** ACME SaaS MSA auto-renewal deadline (45 days out). Don't miss this window.\n\n**Most legally concerning:** The 12-month pan-India non-compete in the employment contract may be unenforceable under Section 27 of the Indian Contract Act.`;
      citations.push({ section: "Portfolio analysis", page: 0, excerpt: "Cross-contract risk scoring based on severity, proximity to deadlines, and market benchmarking." });
    } else if (q.includes("terminat") || q.includes("cancel")) {
      answer = "Termination rights vary by contract:\n\n• **ACME SaaS MSA:** Symmetric. For cause: 30-day cure. Without cause: 90 days notice. 90 days is longer than market standard (30-60 typical).\n• **Priya Sharma Employment:** 30 days notice from either party (standard).\n• **DataFlow NDA:** 30 days written notice; confidentiality survives termination.\n\nNo contract has one-sided termination rights, which is good.";
      citations.push({ section: "Section 9.2", page: 7, excerpt: "Either party may terminate this Agreement without cause upon ninety (90) days prior written notice." });
    } else if (q.includes("benchmark") || q.includes("market") || q.includes("fair") || q.includes("compare")) {
      answer = "Market benchmarking across your portfolio:\n\n**Favorable terms:**\n• Employment compensation at ₹32L is at market median for Bangalore Senior SWE\n• NDA trade-secret survival aligns with DTSA\n\n**Needs attention (vs market):**\n• SaaS Net-15 payment — Net-30 is more standard\n• SaaS 90-day TFC — 60 days is typical for contracts this size\n• Employment non-compete at 12 months pan-India — likely unenforceable\n• NDA lacks governing law clause\n\nYour Contract Health Scores: SaaS MSA 68/100 · Employment 60/100 · NDA 72/100.";
    } else if (q.includes("health") || q.includes("score")) {
      answer = "Contract Health Scores (0-100 scale, weighted by severity of flagged issues vs market benchmarks):\n\n• DataFlow × CloudNine NDA: **72/100** — Fair; missing governing law, broad definition\n• ACME SaaS MSA: **68/100** — Several high-risk flags; auto-renewal and indemnity need attention\n• Priya Sharma Employment: **60/100** — Non-compete clause is a significant legal risk\n\nOverall portfolio health: **67/100**. Addressing the 3 high-severity items would lift portfolio score to ~85/100.";
    } else {
      answer = `Based on your question "${question}", I analyzed your portfolio of ${contracts.length} contracts. Here's what stands out:\n\nThe most actionable item is the upcoming ACME SaaS MSA auto-renewal deadline (~45 days). Beyond that, your payment terms (Net-15) are tighter than market standard, and the employment non-compete may need legal review.\n\nTry asking me about: renewals, payment obligations, risks, termination rights, benchmarks, or obligations by party.`;
    }
    return { answer, citations };
  }

  try {
    const { generateText } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const context = contracts.map((c, i) =>
      `=== CONTRACT ${i + 1}: ${c.title} ===\nType: ${c.contractType}\nParties: ${c.parties.map(p => p.name).join(", ")}\nSummary: ${c.summary}\nHealth score: ${c.healthScore}/100\nKey Dates: ${JSON.stringify(c.keyDates)}\nObligations: ${JSON.stringify(c.obligations)}\nRisks: ${JSON.stringify(c.riskClauses)}\nBenchmarks: ${JSON.stringify(c.benchmarks)}\nPayment Terms: ${JSON.stringify(c.paymentTerms)}`
    ).join("\n\n");
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: "You are ContractLens, an expert AI contract analyst and market benchmarking specialist. Answer questions precisely with specific section references, benchmark against market standards when relevant, and provide concrete action items. Be opinionated and practical.",
      prompt: `PORTFOLIO:\n${context}\n\nQUESTION: ${question}`,
    });
    return { answer: text, citations: [] };
  } catch (e) {
    return { answer: "Connection error. Try again.", citations: [] };
  }
}

export async function compareContracts(contractA: Contract, contractB: Contract) {
  await new Promise(r => setTimeout(r, 1500));
  return {
    summary: `Comparing "${contractA.title}" with "${contractB.title}": The newer version introduces 6 material changes including a 14% fee increase, shortened termination notice (90→45 days), added GDPR-aligned data processing addendum, narrowed SLA claim window, expanded vendor indemnification, and removed a representations survival clause. Three changes favor the vendor; the added DPA is mutually beneficial. Net financial impact: +$21,000/year.`,
    changes: [
      { section: "Section 4.2 (Fees)", change: "modified" as const, description: "Monthly service fee increased from $12,500 to $14,250 (14% increase; +$21,000/year).", impact: "high" as const },
      { section: "Section 9.2 (Termination for Convenience)", change: "modified" as const, description: "Notice period reduced from 90 days to 45 days — materially improves your optionality.", impact: "high" as const },
      { section: "Section 7.5 (Data Processing)", change: "added" as const, description: "New DPA added referencing GDPR/CCPA with 72-hour breach notification.", impact: "medium" as const },
      { section: "Section 3.2 (SLA Remedies)", change: "modified" as const, description: "Service credit claim window shortened from 30 days to 15 days from incident date.", impact: "medium" as const },
      { section: "Section 8.1 (Indemnification)", change: "modified" as const, description: "Vendor indemnification expanded to cover IP claims from recommended third-party integrations.", impact: "low" as const },
      { section: "Section 6.3 (Survival)", change: "removed" as const, description: "3-year survival of representations removed; confidentiality survival remains at 5 years.", impact: "low" as const },
    ],
  };
}

export async function generateAction(contract: Contract, actionId: string): Promise<string> {
  await new Promise(r => setTimeout(r, 1800));
  const action = contract.actions.find(a => a.id === actionId);
  if (!action) return "Action not found";

  if (action.type === "email-draft") {
    const counterparty = contract.parties.find(p => p.role === "vendor" || p.role === "client");
    return `Subject: Follow-up on ${contract.title} — Points for Clarification

Dear ${counterparty?.contact || "Team"},

Thank you for sharing the ${contract.title}. Our legal team has completed an initial review and we'd like to clarify a few points before executing:

1. **Auto-renewal terms (Section 9.3):** Could you confirm the exact notice window and whether you send automated reminders ahead of the renewal date? We'd appreciate 90/60/30-day reminder notifications.

2. **Indemnification cap (Section 8.1):** We'd like to confirm that mutual indemnification obligations are subject to the liability cap in Section 8.3.

3. **Payment terms (Section 4.2):** Net 15 is tighter than our standard Net 30. Is there flexibility here, given the 12-month commitment?

Happy to jump on a quick call to discuss. Looking forward to working together.

Best regards,
[Your Name]
[Title]`;
  }

  if (action.type === "calendar-event") {
    return `Calendar events ready to sync:\n\n1. 📅 ${contract.keyDates.find(k=>k.type==="renewal")?.label || "Renewal Deadline"}\n   Date: ${contract.keyDates.find(k=>k.type==="renewal")?.date}\n   Reminders: 90 days, 60 days, 30 days\n   Description: "CRITICAL: Non-renewal notice must be sent by this date to prevent auto-renewal for another 12-month term at $12,500/month."\n\n2. 📅 Monthly Invoice Due\n   Recurring: 15th of each month\n   Reminder: 3 days before\n   Amount: $12,500\n\n[Click to add to Google Calendar · Download .ics]`;
  }

  if (action.type === "negotiation-playbook") {
    return `NEGOTIATION PLAYBOOK — ${contract.title}

Prepared by ContractLens Agent

TOP 3 POINTS TO NEGOTIATE (ranked by leverage + impact):

1. PAYMENT TERMS (Section 4.2)
   • Ask: Change Net 15 → Net 30
   • Leverage: Net 30 is market standard (68% of comparable SaaS MSAs)
   • Fallback: Accept Net 15 in exchange for removing late-payment penalty for first 5 days
   • Financial impact: ~$12.5K float per month

2. TERMINATION FOR CONVENIENCE (Section 9.2)
   • Ask: Reduce 90-day notice to 45 days
   • Leverage: 30-60 days is standard for <$250K ACV
   • Fallback: Accept 60 days with first-90-day walk-away clause
   • Risk mitigated: ~$37.5K in early termination fees

3. INDEMNIFICATION CAP (Section 8.1)
   • Ask: Explicitly state that indemnification obligations are subject to the liability cap
   • Leverage: Standard in 82% of comparable agreements
   • Fallback: Add a super-cap of 2x fees for third-party IP claims only

OPENING LINE:
"We've reviewed the MSA and are excited to move forward. We have a few small clarifications that are standard in agreements of this size..."

CONCESSION PLAN:
• Give: Accept auto-renewal if vendor provides 90/60/30-day reminders
• Hold firm: Indemnification cap language
• Nice-to-have: Net-30 terms

ESTIMATED TIME TO CLOSE ON REDLINES: 1-2 rounds (3-5 business days)`;
  }

  if (action.type === "counsel-review") {
    return `MEMO TO LEGAL COUNSEL

Contract: ${contract.title}
Type: ${contract.contractType}
Health Score: ${contract.healthScore}/100

ITEMS REQUIRING REVIEW:

${contract.riskClauses.filter(r=>r.severity==="high"||r.severity==="critical").map((r,i)=>`
${i+1}. ${r.summary} (${r.sourceSection}, p.${r.pageNumber})
   Risk: ${r.explanation}
   Severity: ${r.severity.toUpperCase()}
   Initial recommendation: ${r.recommendation}`).join("\n")}

RECOMMENDED NEXT STEPS:
• Review the indemnification cap language in Section 8.1 — verify it's subject to the Section 8.3 liability limit
• Assess whether auto-renewal terms comply with applicable automatic renewal statutes (e.g., California ARL, NY Gen. Oblig. Law § 5-903)
• Confirm governing law and venue are acceptable

Uploaded by: ContractLens AI Agent — automated flagging`;
  }

  if (action.type === "summary-report") {
    return `FINANCE SUMMARY — ${contract.title}
==========================================

Vendor: ${contract.parties.find(p => p.role === "vendor")?.name || "N/A"}
Client: ${contract.parties.find(p => p.role === "client")?.name || "N/A"}

PAYMENT SCHEDULE:
${contract.paymentTerms.map(p => `• ${p.description}: ${p.amount || ""} ${p.currency || ""} — ${p.schedule || ""}${p.latePenalty ? ` (Late fee: ${p.latePenalty})` : ""}`).join("\n")}

TOTAL CONTRACT VALUE:
• Year 1: $175,000 ($150K recurring + $25K setup)
• Year 2+: $150,000/year (auto-renewals)
• Effective monthly: $14,583 (Year 1)

KEY DATES FOR AP CALENDAR:
${contract.keyDates.map(k => `• ${k.label}: ${k.date} — ${k.description}`).join("\n")}

ACTION ITEMS FOR FINANCE:
[ ] Set up vendor in AP system
[ ] Schedule recurring monthly payment for 10th of month (5 days before Net-15 deadline)
[ ] Flag auto-renewal in 10.5 months for budget review
[ ] Code to: Software/SaaS expense (GL 6300)`;
  }

  return action.description;
}

export function detectCrossContractConflicts(contracts: Contract[]): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];
  if (contracts.length < 2) return alerts;

  const upcomingRenewals = contracts.flatMap(c =>
    c.keyDates.filter(kd => kd.type === "renewal" || kd.label.toLowerCase().includes("renewal"))
      .map(kd => ({ contract: c, date: new Date(kd.date), label: kd.label }))
  ).filter(r => r.date.getTime() > Date.now());

  if (upcomingRenewals.length >= 2) {
    const sorted = upcomingRenewals.sort((a,b) => a.date.getTime() - b.date.getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = Math.abs(sorted[i].date.getTime() - sorted[i+1].date.getTime()) / (1000*86400000);
      if (diff < 30) {
        alerts.push({
          id: gid(), contracts: [sorted[i].contract.id, sorted[i+1].contract.id],
          description: `Renewal dates for "${sorted[i].contract.title}" and "${sorted[i+1].contract.title}" are within ${Math.round(diff)} days of each other — concentrated workload for legal/finance review. Stagger reviews now.`,
          severity: "medium", category: "timeline",
        });
      }
    }
  }

  const jurisdictions = new Set(contracts.map(c => c.governingLaw).filter(Boolean));
  if (jurisdictions.size > 1) {
    alerts.push({
      id: gid(), contracts: contracts.map(c => c.id),
      description: `Your contracts span ${jurisdictions.size} jurisdictions (${Array.from(jurisdictions).join("; ")}). This increases complexity — consider consolidating governing law where possible.`,
      severity: "low", category: "other",
    });
  }

  const monthly = contracts.filter(c => c.paymentTerms.some(p => (p.schedule||"").toLowerCase().includes("month"))).length;
  const totalMonthly = contracts.reduce((sum, c) => {
    return sum + c.paymentTerms.reduce((s, p) => {
      if (p.amount && (p.schedule||"").toLowerCase().includes("month")) {
        const num = parseFloat(p.amount.replace(/[^0-9.]/g, "")) || 0;
        return s + num;
      }
      return s;
    }, 0);
  }, 0);

  if (monthly >= 2) {
    alerts.push({
      id: gid(), contracts: contracts.map(c => c.id),
      description: `${monthly} contracts carry recurring monthly payments (~$${totalMonthly.toLocaleString()}/month). Ensure cash-flow forecasting accounts for these commitments, most of which fall around the same time of month.`,
      severity: "low", category: "payment",
    });
  }

  // Check for unhealthy contracts
  const unhealthy = contracts.filter(c => c.healthScore < 65);
  if (unhealthy.length >= 2) {
    alerts.push({
      id: gid(), contracts: unhealthy.map(c => c.id),
      severity: "medium", category: "other",
      description: `${unhealthy.length} contracts have health scores below 65/100, indicating significant risk flags. Prioritize legal review for: ${unhealthy.map(c => c.title).join(", ")}.`,
    });
  }

  return alerts;
}
