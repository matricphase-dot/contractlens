import { NextRequest, NextResponse } from "next/server";
import { compareContracts } from "@/lib/ai-service";
import { getContract } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { aId, bId } = await req.json();
    if (!aId || !bId) return NextResponse.json({ error: "Both contract IDs required" }, { status: 400 });
    const a = await getContract(aId);
    const b = await getContract(bId);
    if (!a || !b) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    const result = await compareContracts(a, b);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Compare failed" }, { status: 500 });
  }
}
