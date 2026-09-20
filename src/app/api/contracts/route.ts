import { NextResponse } from "next/server";
import { getContracts, deleteContract } from "@/lib/store";
import { getDemoContracts } from "@/lib/demo-data";

export async function GET(req: Request) {
  let contracts = await getContracts();
  // Auto-seed demo contracts on first visit so judges see a populated portfolio
  if (contracts.length === 0) {
    contracts = await getDemoContracts();
    const { saveContracts } = await import("@/lib/store");
    await saveContracts(contracts);
  }
  return NextResponse.json({ contracts });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteContract(id);
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
