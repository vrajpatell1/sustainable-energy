import { NextResponse } from "next/server";

import { calculateCloudCost } from "@/lib/energy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toNumber = (value: unknown) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const workloadName =
      typeof body.workloadName === "string" && body.workloadName.trim().length > 0
        ? body.workloadName.trim()
        : "Sustainable workload";
    const provider = typeof body.provider === "string" ? body.provider : "";
    const hours = toNumber(body.hours);
    const vcpu = toNumber(body.vcpu);
    const memoryGb = toNumber(body.memoryGb);
    const storageGb = toNumber(body.storageGb);
    const transferGb = toNumber(body.transferGb);

    if (
      !provider ||
      [hours, vcpu, memoryGb, storageGb, transferGb].some((value) => !Number.isFinite(value)) ||
      hours <= 0 ||
      vcpu <= 0 ||
      memoryGb <= 0 ||
      storageGb < 0 ||
      transferGb < 0
    ) {
      return NextResponse.json(
        { error: "Please provide valid positive values for the workload inputs." },
        { status: 400 }
      );
    }

    const result = await calculateCloudCost({
      workloadName,
      provider,
      hours,
      vcpu,
      memoryGb,
      storageGb,
      transferGb
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to calculate this cloud cost estimate."
      },
      { status: 500 }
    );
  }
}
