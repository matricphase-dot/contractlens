import { NextRequest, NextResponse } from "next/server";
import { getContract, updateContract } from "@/lib/store";

export async function PATCH(req: NextRequest) {
  try {
    const { contractId, obligationId, completed } = await req.json();
    const contract = await getContract(contractId);
    if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updatedObligations = contract.obligations.map(o =>
      o.id === obligationId ? { ...o, completed } : o
    );
    await updateContract(contractId, { obligations: updatedObligations });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
