import { NextRequest, NextResponse } from "next/server";
import { analyzeContract } from "@/lib/ai-service";
import { addContract } from "@/lib/store";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const contract = await analyzeContract(file.name, buffer);
    await addContract(contract);
    return NextResponse.json({ contract });
  } catch (e: any) {
    console.error("Analyze error:", e);
    return NextResponse.json({ error: e?.message || "Analysis failed" }, { status: 500 });
  }
}
