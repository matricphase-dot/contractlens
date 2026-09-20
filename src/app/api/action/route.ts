import { NextRequest, NextResponse } from "next/server";
import { generateAction } from "@/lib/ai-service";
import { getContract, updateContract } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { contractId, actionId } = await req.json();
    if (!contractId || !actionId) return NextResponse.json({ error: "contractId & actionId required" }, { status: 400 });
    const contract = await getContract(contractId);
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    // Mark generating
    const updatedActions = contract.actions.map(a => a.id === actionId ? { ...a, status: "generating" as const } : a);
    await updateContract(contractId, { actions: updatedActions });

    const output = await generateAction(contract, actionId);

    const finalActions = (await getContract(contractId))!.actions.map(a =>
      a.id === actionId ? { ...a, status: "ready" as const, output } : a
    );
    await updateContract(contractId, { actions: finalActions });

    return NextResponse.json({ output });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { contractId, actionId, status } = await req.json();
    const contract = await getContract(contractId);
    if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updatedActions = contract.actions.map(a => a.id === actionId ? { ...a, status } : a);
    await updateContract(contractId, { actions: updatedActions });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
