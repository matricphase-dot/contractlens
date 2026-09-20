import { NextRequest, NextResponse } from "next/server";
import { getContracts, saveContracts, deleteContract, addContract } from "@/lib/store";

export async function GET() {
  const contracts = await getContracts();
  return NextResponse.json({ contracts });
}

// POST: import/seed contracts (used by client to hydrate server state from localStorage)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.contracts) ? body.contracts : [];
    if (incoming.length === 0) return NextResponse.json({ contracts: await getContracts() });

    const existing = await getContracts();
    const existingIds = new Set(existing.map((c: any) => c.id));
    let merged = [...existing];
    for (const c of incoming) {
      if (!existingIds.has(c.id)) merged.push(c);
    }
    await saveContracts(merged);
    return NextResponse.json({ contracts: merged });
  } catch (e) {
    return NextResponse.json({ contracts: await getContracts() });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteContract(id);
  // Also remove from localStorage via response header hint — client handles
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
