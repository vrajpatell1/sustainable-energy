import { neon } from "@neondatabase/serverless";

import type {
  AiProfile,
  CloudProfile,
  ComparisonBenchmark,
  CostEstimate,
  DashboardPayload,
  ScenarioGroup,
  TokenAnalysis
} from "@/lib/types";

type CostEstimateInput = Omit<CostEstimate, "id" | "createdAt">;
type TokenAnalysisInput = Omit<TokenAnalysis, "id" | "createdAt">;

type CostEstimateRow = {
  id: number | string;
  workload_name: string;
  provider: string;
  hours: number | string;
  vcpu: number | string;
  memory_gb: number | string;
  storage_gb: number | string;
  transfer_gb: number | string;
  compute_cost: number | string;
  storage_cost: number | string;
  transfer_cost: number | string;
  total_cost: number | string;
  sustainability_score: number | string;
  carbon_kg: number | string;
  created_at: string | Date;
};

type TokenAnalysisRow = {
  id: number | string;
  model_key: string;
  prompt_tokens: number | string;
  response_tokens: number | string;
  daily_requests: number | string;
  energy_wh: number | string;
  carbon_grams: number | string;
  optimized_energy_wh: number | string;
  optimized_carbon_grams: number | string;
  savings_pct: number | string;
  created_at: string | Date;
};

type SnapshotCountRow = {
  total: number | string;
};

declare global {
  // eslint-disable-next-line no-var
  var sustainableEnergyDbInit: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var sustainableEnergyCostCache: CostEstimate[] | undefined;
  // eslint-disable-next-line no-var
  var sustainableEnergyTokenCache: TokenAnalysis[] | undefined;
}

const cloudSeed: CloudProfile[] = [
  {
    provider: "aws",
    displayName: "AWS Graviton Mix",
    hourlyCpu: 0.021,
    hourlyRam: 0.0042,
    storageMonthlyGb: 0.09,
    egressGb: 0.085,
    greenScore: 82,
    carbonIntensity: 0.31,
    highlight: "Strong global scale with efficient ARM-based compute options."
  },
  {
    provider: "azure",
    displayName: "Azure Sustainable Compute",
    hourlyCpu: 0.023,
    hourlyRam: 0.0046,
    storageMonthlyGb: 0.095,
    egressGb: 0.082,
    greenScore: 79,
    carbonIntensity: 0.29,
    highlight: "Balanced enterprise footprint with mature sustainability reporting."
  },
  {
    provider: "gcp",
    displayName: "Google Cloud Carbon-Aware",
    hourlyCpu: 0.02,
    hourlyRam: 0.004,
    storageMonthlyGb: 0.082,
    egressGb: 0.08,
    greenScore: 88,
    carbonIntensity: 0.24,
    highlight: "Low-carbon regions and strong data analytics ecosystem."
  }
];

const aiSeed: AiProfile[] = [
  {
    modelKey: "lite",
    label: "Lite Inference",
    energyPerThousandTokens: 0.035,
    optimizedSavingPct: 24,
    carbonGramsPerWh: 0.42,
    bestFor: "FAQ bots, summaries, and retrieval-heavy workflows."
  },
  {
    modelKey: "balanced",
    label: "Balanced Assistant",
    energyPerThousandTokens: 0.06,
    optimizedSavingPct: 19,
    carbonGramsPerWh: 0.45,
    bestFor: "General copilots that need higher reasoning quality."
  },
  {
    modelKey: "frontier",
    label: "Frontier Reasoning",
    energyPerThousandTokens: 0.11,
    optimizedSavingPct: 28,
    carbonGramsPerWh: 0.48,
    bestFor: "Complex workflows, planning, and long-form generation."
  }
];

const benchmarkSeed: ComparisonBenchmark[] = [
  {
    scenario: "ecommerce",
    scenarioLabel: "Eco-Commerce Platform",
    provider: "aws",
    monthlyCost: 1280,
    scalability: 9.1,
    performance: 8.8,
    latencyMs: 118
  },
  {
    scenario: "ecommerce",
    scenarioLabel: "Eco-Commerce Platform",
    provider: "azure",
    monthlyCost: 1325,
    scalability: 8.8,
    performance: 8.7,
    latencyMs: 126
  },
  {
    scenario: "ecommerce",
    scenarioLabel: "Eco-Commerce Platform",
    provider: "gcp",
    monthlyCost: 1215,
    scalability: 8.9,
    performance: 9.2,
    latencyMs: 110
  },
  {
    scenario: "smart-grid",
    scenarioLabel: "Smart Grid Monitor",
    provider: "aws",
    monthlyCost: 980,
    scalability: 9,
    performance: 8.6,
    latencyMs: 104
  },
  {
    scenario: "smart-grid",
    scenarioLabel: "Smart Grid Monitor",
    provider: "azure",
    monthlyCost: 1010,
    scalability: 9.2,
    performance: 8.4,
    latencyMs: 111
  },
  {
    scenario: "smart-grid",
    scenarioLabel: "Smart Grid Monitor",
    provider: "gcp",
    monthlyCost: 945,
    scalability: 8.7,
    performance: 9.1,
    latencyMs: 97
  },
  {
    scenario: "learning-hub",
    scenarioLabel: "Video Learning Hub",
    provider: "aws",
    monthlyCost: 1670,
    scalability: 9.3,
    performance: 8.9,
    latencyMs: 122
  },
  {
    scenario: "learning-hub",
    scenarioLabel: "Video Learning Hub",
    provider: "azure",
    monthlyCost: 1715,
    scalability: 9,
    performance: 8.6,
    latencyMs: 129
  },
  {
    scenario: "learning-hub",
    scenarioLabel: "Video Learning Hub",
    provider: "gcp",
    monthlyCost: 1590,
    scalability: 9.1,
    performance: 9.3,
    latencyMs: 116
  }
];

const toNumber = (value: number | string) => Number(value);

const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

function getSql() {
  const connectionString = process.env.DATABASE_URL;

  return connectionString ? neon(connectionString) : null;
}

async function ensureDatabase() {
  const sql = getSql();

  if (!sql) {
    return false;
  }

  if (!globalThis.sustainableEnergyDbInit) {
    globalThis.sustainableEnergyDbInit = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS cost_estimates (
          id SERIAL PRIMARY KEY,
          workload_name TEXT NOT NULL,
          provider TEXT NOT NULL,
          hours DOUBLE PRECISION NOT NULL,
          vcpu DOUBLE PRECISION NOT NULL,
          memory_gb DOUBLE PRECISION NOT NULL,
          storage_gb DOUBLE PRECISION NOT NULL,
          transfer_gb DOUBLE PRECISION NOT NULL,
          compute_cost DOUBLE PRECISION NOT NULL,
          storage_cost DOUBLE PRECISION NOT NULL,
          transfer_cost DOUBLE PRECISION NOT NULL,
          total_cost DOUBLE PRECISION NOT NULL,
          sustainability_score INTEGER NOT NULL,
          carbon_kg DOUBLE PRECISION NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS token_analyses (
          id SERIAL PRIMARY KEY,
          model_key TEXT NOT NULL,
          prompt_tokens DOUBLE PRECISION NOT NULL,
          response_tokens DOUBLE PRECISION NOT NULL,
          daily_requests DOUBLE PRECISION NOT NULL,
          energy_wh DOUBLE PRECISION NOT NULL,
          carbon_grams DOUBLE PRECISION NOT NULL,
          optimized_energy_wh DOUBLE PRECISION NOT NULL,
          optimized_carbon_grams DOUBLE PRECISION NOT NULL,
          savings_pct DOUBLE PRECISION NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })();
  }

  await globalThis.sustainableEnergyDbInit;

  return true;
}

function getRecentCostCache() {
  if (!globalThis.sustainableEnergyCostCache) {
    globalThis.sustainableEnergyCostCache = [];
  }

  return globalThis.sustainableEnergyCostCache;
}

function getRecentTokenCache() {
  if (!globalThis.sustainableEnergyTokenCache) {
    globalThis.sustainableEnergyTokenCache = [];
  }

  return globalThis.sustainableEnergyTokenCache;
}

function mapCostEstimateRow(row: CostEstimateRow): CostEstimate {
  return {
    id: toNumber(row.id),
    workloadName: row.workload_name,
    provider: row.provider,
    hours: toNumber(row.hours),
    vcpu: toNumber(row.vcpu),
    memoryGb: toNumber(row.memory_gb),
    storageGb: toNumber(row.storage_gb),
    transferGb: toNumber(row.transfer_gb),
    computeCost: toNumber(row.compute_cost),
    storageCost: toNumber(row.storage_cost),
    transferCost: toNumber(row.transfer_cost),
    totalCost: toNumber(row.total_cost),
    sustainabilityScore: toNumber(row.sustainability_score),
    carbonKg: toNumber(row.carbon_kg),
    createdAt: formatDate(row.created_at)
  };
}

function mapTokenAnalysisRow(row: TokenAnalysisRow): TokenAnalysis {
  return {
    id: toNumber(row.id),
    modelKey: row.model_key,
    promptTokens: toNumber(row.prompt_tokens),
    responseTokens: toNumber(row.response_tokens),
    dailyRequests: toNumber(row.daily_requests),
    energyWh: toNumber(row.energy_wh),
    carbonGrams: toNumber(row.carbon_grams),
    optimizedEnergyWh: toNumber(row.optimized_energy_wh),
    optimizedCarbonGrams: toNumber(row.optimized_carbon_grams),
    savingsPct: toNumber(row.savings_pct),
    createdAt: formatDate(row.created_at)
  };
}

export function getCloudProfiles(): CloudProfile[] {
  return [...cloudSeed].sort((left, right) => right.greenScore - left.greenScore);
}

export function getCloudProfile(provider: string) {
  return cloudSeed.find((item) => item.provider === provider);
}

export function getAiProfiles(): AiProfile[] {
  return [...aiSeed].sort(
    (left, right) => left.energyPerThousandTokens - right.energyPerThousandTokens
  );
}

export function getAiProfile(modelKey: string) {
  return aiSeed.find((item) => item.modelKey === modelKey);
}

export function getBenchmarks(): ScenarioGroup[] {
  const grouped = new Map<string, ScenarioGroup>();

  for (const row of benchmarkSeed) {
    const existing = grouped.get(row.scenario);

    if (existing) {
      existing.entries.push(row);
      continue;
    }

    grouped.set(row.scenario, {
      scenario: row.scenario,
      scenarioLabel: row.scenarioLabel,
      entries: [row]
    });
  }

  return [...grouped.values()];
}

export async function saveCostEstimate(input: CostEstimateInput) {
  const sql = getSql();

  if (await ensureDatabase()) {
    await sql!`
      INSERT INTO cost_estimates (
        workload_name,
        provider,
        hours,
        vcpu,
        memory_gb,
        storage_gb,
        transfer_gb,
        compute_cost,
        storage_cost,
        transfer_cost,
        total_cost,
        sustainability_score,
        carbon_kg
      ) VALUES (
        ${input.workloadName},
        ${input.provider},
        ${input.hours},
        ${input.vcpu},
        ${input.memoryGb},
        ${input.storageGb},
        ${input.transferGb},
        ${input.computeCost},
        ${input.storageCost},
        ${input.transferCost},
        ${input.totalCost},
        ${input.sustainabilityScore},
        ${input.carbonKg}
      )
    `;

    return;
  }

  const cache = getRecentCostCache();
  const nextId = cache.length > 0 ? Math.max(...cache.map((item) => item.id)) + 1 : 1;

  cache.unshift({
    id: nextId,
    createdAt: new Date().toISOString(),
    ...input
  });
  cache.splice(6);
}

export async function saveTokenAnalysis(input: TokenAnalysisInput) {
  const sql = getSql();

  if (await ensureDatabase()) {
    await sql!`
      INSERT INTO token_analyses (
        model_key,
        prompt_tokens,
        response_tokens,
        daily_requests,
        energy_wh,
        carbon_grams,
        optimized_energy_wh,
        optimized_carbon_grams,
        savings_pct
      ) VALUES (
        ${input.modelKey},
        ${input.promptTokens},
        ${input.responseTokens},
        ${input.dailyRequests},
        ${input.energyWh},
        ${input.carbonGrams},
        ${input.optimizedEnergyWh},
        ${input.optimizedCarbonGrams},
        ${input.savingsPct}
      )
    `;

    return;
  }

  const cache = getRecentTokenCache();
  const nextId = cache.length > 0 ? Math.max(...cache.map((item) => item.id)) + 1 : 1;

  cache.unshift({
    id: nextId,
    createdAt: new Date().toISOString(),
    ...input
  });
  cache.splice(6);
}

export async function getRecentCostEstimates(limit = 5): Promise<CostEstimate[]> {
  const sql = getSql();

  if (await ensureDatabase()) {
    const rows = (await sql!`
      SELECT
        id,
        workload_name,
        provider,
        hours,
        vcpu,
        memory_gb,
        storage_gb,
        transfer_gb,
        compute_cost,
        storage_cost,
        transfer_cost,
        total_cost,
        sustainability_score,
        carbon_kg,
        created_at
      FROM cost_estimates
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit}
    `) as CostEstimateRow[];

    return rows.map(mapCostEstimateRow);
  }

  return getRecentCostCache().slice(0, limit);
}

export async function getRecentTokenAnalyses(limit = 5): Promise<TokenAnalysis[]> {
  const sql = getSql();

  if (await ensureDatabase()) {
    const rows = (await sql!`
      SELECT
        id,
        model_key,
        prompt_tokens,
        response_tokens,
        daily_requests,
        energy_wh,
        carbon_grams,
        optimized_energy_wh,
        optimized_carbon_grams,
        savings_pct,
        created_at
      FROM token_analyses
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit}
    `) as TokenAnalysisRow[];

    return rows.map(mapTokenAnalysisRow);
  }

  return getRecentTokenCache().slice(0, limit);
}

async function getSnapshotCount() {
  const sql = getSql();

  if (await ensureDatabase()) {
    const [row] = (await sql!`
      SELECT (
        (SELECT COUNT(*) FROM cost_estimates) +
        (SELECT COUNT(*) FROM token_analyses)
      ) AS total
    `) as SnapshotCountRow[];

    return toNumber(row?.total ?? 0);
  }

  return getRecentCostCache().length + getRecentTokenCache().length;
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const providers = getCloudProfiles();
  const aiProfiles = getAiProfiles();
  const scenarios = getBenchmarks();
  const [recentCosts, recentTokenAnalyses, snapshotsLogged] = await Promise.all([
    getRecentCostEstimates(4),
    getRecentTokenAnalyses(4),
    getSnapshotCount()
  ]);

  const averageGreenScore =
    providers.reduce((sum, item) => sum + item.greenScore, 0) / Math.max(providers.length, 1);
  const annualSavingsHeadline = `${Math.round(
    aiProfiles.reduce((sum, item) => sum + item.optimizedSavingPct, 0) / aiProfiles.length
  )}% token-energy reduction with prompt optimization`;

  return {
    providers,
    aiProfiles,
    scenarios,
    recentCosts,
    recentTokenAnalyses,
    overview: {
      providersTracked: providers.length,
      averageGreenScore: Number(averageGreenScore.toFixed(1)),
      snapshotsLogged,
      annualSavingsHeadline
    }
  };
}
