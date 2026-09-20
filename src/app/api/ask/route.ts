import { NextRequest, NextResponse } from "next/server";
import { askContractQuestion } from "@/lib/ai-service";
import { getContracts, getContract } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { question, contractId } = await req.json();
    if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

    let contracts;
    if (contractId && contractId !== "all") {
      const c = await getContract(contractId);
      contracts = c ? [c] : await getContracts();
    } else {
      contracts = await getContracts();
    }

    if (contracts.length === 0) {
      return NextResponse.json({
        answer: "No contracts found in your portfolio. Upload a contract first to ask questions about it.",
        citations: [],
      });
    }

    const result = await askContractQuestion(contracts, question);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ask failed" }, { status: 500 });
  }
}
