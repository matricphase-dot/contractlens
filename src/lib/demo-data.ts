import { analyzeContract } from "./ai-service";

let cached: any = null;

export async function getDemoContracts() {
  if (cached) return cached;
  const samples = [
    { name: "Acme_SaaS_MSA_2026.pdf", variant: "msa" as const, text: "SaaS Master Services Agreement" },
    { name: "Priya_Sharma_Employment_Offer.pdf", variant: "employment" as const, text: "Employment Agreement Senior Engineer Bangalore India Non Compete" },
    { name: "DataFlow_CloudNine_Mutual_NDA.pdf", variant: "nda" as const, text: "Mutual Non-Disclosure Agreement" },
  ];
  const contracts = [];
  for (const s of samples) {
    const buf = Buffer.from(s.text.repeat(50));
    contracts.push(await analyzeContract(s.name, buf, s.variant));
  }
  cached = contracts;
  return contracts;
}
