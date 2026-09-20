import { NextResponse } from "next/server";
import { getContracts, deleteContract } from "@/lib/store";

export async function GET() {
  const contracts = await getContracts();
  return NextResponse.json({ contracts });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteContract(id);
  return NextResponse.json({ ok: true });
}
