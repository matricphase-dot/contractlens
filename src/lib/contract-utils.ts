"use client";

import type { Contract, ConflictAlert } from "./types";

function gid(): string { return Math.random().toString(36).slice(2, 10); }

export function detectCrossContractConflicts(contracts: Contract[]): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];
  if (contracts.length < 2) return alerts;

  const upcomingRenewals = contracts.flatMap(c =>
    c.keyDates.filter(kd => kd.type === "renewal" || kd.label.toLowerCase().includes("renewal"))
      .map(kd => ({ contract: c, date: new Date(kd.date), label: kd.label }))
  ).filter(r => r.date.getTime() > Date.now());

  if (upcomingRenewals.length >= 2) {
    const sorted = upcomingRenewals.sort((a, b) => a.date.getTime() - b.date.getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = Math.abs(sorted[i].date.getTime() - sorted[i + 1].date.getTime()) / (1000 * 86400000);
      if (diff < 30) {
        alerts.push({
          id: gid(),
          contracts: [sorted[i].contract.id, sorted[i + 1].contract.id],
          description: `Renewal dates for "${sorted[i].contract.title}" and "${sorted[i + 1].contract.title}" are within ${Math.round(diff)} days of each other — concentrated workload for legal/finance review.`,
          severity: "medium",
          category: "timeline",
        });
      }
    }
  }

  const jurisdictions = new Set(contracts.map(c => c.governingLaw).filter(Boolean));
  if (jurisdictions.size > 1) {
    alerts.push({
      id: gid(),
      contracts: contracts.map(c => c.id),
      description: `Your contracts span ${jurisdictions.size} different governing jurisdictions (${Array.from(jurisdictions).join("; ")}). This increases legal complexity if disputes arise.`,
      severity: "low",
      category: "other",
    });
  }

  const monthly = contracts.filter(c => c.paymentTerms.some(p => (p.schedule || "").toLowerCase().includes("month"))).length;
  if (monthly >= 2) {
    alerts.push({
      id: gid(),
      contracts: contracts.map(c => c.id),
      description: `${monthly} contracts have recurring monthly payment obligations. Ensure cash-flow forecasting accounts for overlapping monthly commitments.`,
      severity: "low",
      category: "payment",
    });
  }

  return alerts;
}

export function getMockCompareResult(titleA: string, titleB: string) {
  return {
    summary: `Comparing "${titleA}" with "${titleB}": The newer version introduces 5 material changes, including an increased service fee, shortened termination notice period, added data processing addendum, narrowed SLA remedy window, and expanded indemnification scope. Three changes favor the vendor; one change (added DPA) is neutral/beneficial.`,
    changes: [
      { section: "Section 4.2 (Fees)", change: "modified" as const, description: "Monthly service fee increased from $12,500 to $14,250 (14% increase).", impact: "high" as const },
      { section: "Section 9.2 (Termination for Convenience)", change: "modified" as const, description: "Notice period reduced from 90 days to 45 days.", impact: "high" as const },
      { section: "Section 7.5 (Data Processing)", change: "added" as const, description: "New DPA added referencing GDPR/CCPA obligations and data breach notification within 72 hours.", impact: "medium" as const },
      { section: "Section 3.2 (SLA Remedies)", change: "modified" as const, description: "Service credit claim window shortened from 30 days to 15 days from incident.", impact: "medium" as const },
      { section: "Section 8.1 (Indemnification)", change: "modified" as const, description: "Vendor indemnification expanded to cover IP claims from third-party integrations used per vendor recommendation.", impact: "low" as const },
      { section: "Section 6.3 (Survival)", change: "removed" as const, description: "The 3-year survival of representations clause was removed; confidentiality survival remains at 5 years.", impact: "low" as const },
    ],
  };
}
