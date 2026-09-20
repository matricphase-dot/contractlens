export interface Party {
  name: string;
  role: "disclosing" | "receiving" | "buyer" | "seller" | "vendor" | "client" | "licensor" | "licensee" | "employer" | "contractor" | "other";
  contact?: string;
}

export interface Obligation {
  id: string;
  party: string;
  description: string;
  dueDate?: string;
  category: "payment" | "delivery" | "confidentiality" | "compliance" | "notice" | "renewal" | "termination" | "reporting" | "other";
  severity: "critical" | "high" | "medium" | "low";
  sourceSection: string;
  pageNumber: number;
  completed?: boolean;
}

export interface MarketBenchmark {
  clause: string;
  yourTerm: string;
  marketStandard: string;
  favorability: "favorable" | "neutral" | "unfavorable" | "mixed";
  insight: string;
}

export interface RiskClause {
  id: string;
  clauseType: "auto-renewal" | "unlimited-liability" | "one-sided-termination" | "broad-indemnification" | "vague-sla" | "late-payment-penalty" | "non-compete" | "ip-assignment" | "governing-law" | "other";
  severity: "critical" | "high" | "medium" | "low";
  summary: string;
  explanation: string;
  recommendation: string;
  sourceSection: string;
  pageNumber: number;
}

export interface KeyDate {
  id: string;
  label: string;
  date: string;
  type: "effective" | "expiration" | "renewal" | "payment-due" | "notice-deadline" | "deliverable" | "other";
  description: string;
  sourceSection: string;
  dismissed?: boolean;
}

export interface PaymentTerm {
  description: string;
  amount?: string;
  currency?: string;
  schedule?: string;
  latePenalty?: string;
  sourceSection: string;
}

export interface AgentAction {
  id: string;
  type: "email-draft" | "calendar-event" | "negotiation-playbook" | "counsel-review" | "summary-report" | "reminder";
  title: string;
  description: string;
  status: "suggested" | "generating" | "ready" | "dismissed";
  output?: string;
  relatedRiskId?: string;
  relatedObligationId?: string;
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  stage: "parse" | "extract" | "classify" | "benchmark" | "cross-reference" | "recommend" | "monitor";
  message: string;
  detail?: string;
}

export interface Contract {
  id: string;
  fileName: string;
  uploadedAt: string;
  title: string;
  contractType: string;
  parties: Party[];
  effectiveDate?: string;
  expirationDate?: string;
  renewalTerms?: string;
  paymentTerms: PaymentTerm[];
  terminationConditions?: string;
  governingLaw?: string;
  keyDates: KeyDate[];
  obligations: Obligation[];
  riskClauses: RiskClause[];
  benchmarks: MarketBenchmark[];
  healthScore: number;
  summary: string;
  tags: string[];
  status: "analyzed" | "analyzing" | "error" | "uploaded";
  fullText: string;
  actions: AgentAction[];
  agentEvents: AgentEvent[];
  versionOf?: string;
  versionNumber?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { section: string; page: number; excerpt: string }[];
  timestamp: string;
}

export interface ConflictAlert {
  id: string;
  contracts: string[];
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "timeline" | "exclusivity" | "payment" | "scope" | "other";
}
