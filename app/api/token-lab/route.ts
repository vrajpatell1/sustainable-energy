import { NextResponse } from "next/server";

import { calculateTokenAnalysis } from "@/lib/energy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toNumber = (value: unknown) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const modelKey = typeof body.modelKey === "string" ? body.modelKey : "";
    const promptTokens = toNumber(body.promptTokens);
    const responseTokens = toNumber(body.responseTokens);
    const dailyRequests = toNumber(body.dailyRequests);

    if (
      !modelKey ||
      [promptTokens, responseTokens, dailyRequests].some((value) => !Number.isFinite(value)) ||
      promptTokens <= 0 ||
      responseTokens <= 0 ||
      dailyRequests <= 0
    ) {
      return NextResponse.json(
        { error: "Please provide valid positive values for the token analysis." },
        { status: 400 }
      );
    }

    const result = calculateTokenAnalysis({
      modelKey,
      promptTokens,
      responseTokens,
      dailyRequests
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to calculate this token analysis."
      },
      { status: 500 }
    );
  }
}
