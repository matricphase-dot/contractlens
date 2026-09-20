import { NextResponse } from "next/server";
import { analyzeContract } from "@/lib/ai-service";
import { getContracts, saveContracts } from "@/lib/store";

export async function POST() {
  const existing = await getContracts();
  if (existing.length >= 3) return NextResponse.json({ count: existing.length, skipped: true });

  const samples = [
    { name: "Acme_SaaS_MSA_2026.pdf", variant: "msa" as const, text: "SaaS Master Services Agreement" },
    { name: "Priya_Sharma_Employment_Offer.pdf", variant: "employment" as const, text: "Employment Agreement Senior Engineer Bangalore India Non Compete" },
    { name: "DataFlow_CloudNine_Mutual_NDA.pdf", variant: "nda" as const, text: "Mutual Non-Disclosure Agreement" },
  ];

  const contracts = [];
  for (const s of samples) {
    const buf = Buffer.from(s.text.repeat(50));
    const c = await analyzeContract(s.name, buf, s.variant);
    contracts.push(c);
  }

  await saveContracts(contracts);
  return NextResponse.json({ count: contracts.length, skipped: false });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

