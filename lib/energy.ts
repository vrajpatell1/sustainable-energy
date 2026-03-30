import {
  getAiProfile,
  getCloudProfile,
  saveCostEstimate,
  saveTokenAnalysis
} from "@/lib/db";
import type {
  CostCalculatorInput,
  CostCalculatorResult,
  TokenAnalysisInput,
  TokenAnalysisResult
} from "@/lib/types";

const round = (value: number) => Number(value.toFixed(2));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export async function calculateCloudCost(input: CostCalculatorInput): Promise<CostCalculatorResult> {
  const profile = getCloudProfile(input.provider);

  if (!profile) {
    throw new Error("Unknown cloud provider.");
  }

  const computeCost = round(
    input.hours * (input.vcpu * profile.hourlyCpu + input.memoryGb * profile.hourlyRam)
  );
  const storageCost = round(input.storageGb * profile.storageMonthlyGb);
  const transferCost = round(input.transferGb * profile.egressGb);
  const totalCost = round(computeCost + storageCost + transferCost);

  const computeKwh = input.hours * (input.vcpu * 0.045 + input.memoryGb * 0.006);
  const storageKwh = input.storageGb * 0.0024;
  const transferKwh = input.transferGb * 0.0095;
  const monthlyKwh = round(computeKwh + storageKwh + transferKwh);
  const carbonKg = round(monthlyKwh * profile.carbonIntensity);

  const sustainabilityScore = Math.round(
    clamp(profile.greenScore + 8 - monthlyKwh * 0.1 - input.transferGb * 0.025, 42, 98)
  );

  const insights = [
    `${profile.displayName} is projected at $${totalCost}/month for this workload.`,
    `Compute is ${round((computeCost / Math.max(totalCost, 1)) * 100)}% of your monthly spend.`,
    input.transferGb > input.storageGb
      ? "Network transfer is the biggest sustainability lever for this workload."
      : "Storage growth is manageable, so efficient autoscaling will likely drive the best savings."
  ];

  await saveCostEstimate({
    workloadName: input.workloadName,
    provider: input.provider,
    hours: input.hours,
    vcpu: input.vcpu,
    memoryGb: input.memoryGb,
    storageGb: input.storageGb,
    transferGb: input.transferGb,
    computeCost,
    storageCost,
    transferCost,
    totalCost,
    sustainabilityScore,
    carbonKg
  });

  return {
    profile,
    workloadName: input.workloadName,
    computeCost,
    storageCost,
    transferCost,
    totalCost,
    monthlyKwh,
    carbonKg,
    sustainabilityScore,
    insights
  };
}

export async function calculateTokenAnalysis(
  input: TokenAnalysisInput
): Promise<TokenAnalysisResult> {
  const profile = getAiProfile(input.modelKey);

  if (!profile) {
    throw new Error("Unknown AI model profile.");
  }

  const totalTokensPerRequest = input.promptTokens + input.responseTokens;
  const monthlyTokens = totalTokensPerRequest * input.dailyRequests * 30;
  const energyWh = round((monthlyTokens / 1000) * profile.energyPerThousandTokens);
  const carbonGrams = round(energyWh * profile.carbonGramsPerWh);
  const optimizedEnergyWh = round(energyWh * (1 - profile.optimizedSavingPct / 100));
  const optimizedCarbonGrams = round(carbonGrams * (1 - profile.optimizedSavingPct / 100));
  const annualSavingsKwh = round(((energyWh - optimizedEnergyWh) * 12) / 1000);
  const annualSavingsKg = round(((carbonGrams - optimizedCarbonGrams) * 12) / 1000);

  const recommendations = [
    input.promptTokens > input.responseTokens * 1.8
      ? "Shorten repeated system instructions and move stable context into retrieval."
      : "Your prompt-response balance is healthy; focus next on routing simple tasks to smaller models.",
    input.dailyRequests > 400
      ? "Introduce response caching for frequent prompts to cut repeated inference energy."
      : "Batch requests during off-peak periods when possible to improve energy efficiency.",
    input.modelKey === "frontier"
      ? "Reserve frontier reasoning for complex cases and route routine tasks to a balanced model."
      : "Use structured outputs to reduce unnecessary regeneration and lower token waste."
  ];

  await saveTokenAnalysis({
    modelKey: input.modelKey,
    promptTokens: input.promptTokens,
    responseTokens: input.responseTokens,
    dailyRequests: input.dailyRequests,
    energyWh,
    carbonGrams,
    optimizedEnergyWh,
    optimizedCarbonGrams,
    savingsPct: profile.optimizedSavingPct
  });

  return {
    profile,
    totalTokensPerRequest,
    monthlyTokens,
    energyWh,
    carbonGrams,
    optimizedEnergyWh,
    optimizedCarbonGrams,
    annualSavingsKwh,
    annualSavingsKg,
    recommendations
  };
}
