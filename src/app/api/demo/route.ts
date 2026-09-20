import { NextResponse } from "next/server";
import { getDemoContracts } from "@/lib/demo-data";
import { saveContracts, getContracts } from "@/lib/store";

export async function POST() {
  const existing = await getContracts();
  if (existing.length >= 3) return NextResponse.json({ count: existing.length, skipped: true });
  const contracts = await getDemoContracts();
  await saveContracts(contracts);
  return NextResponse.json({ count: contracts.length, skipped: false });
}

export async function GET() {
  return POST();
}

export const dynamic = "force-dynamic";
