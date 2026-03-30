import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import type {
  AiProfile,
  CloudProfile,
  ComparisonBenchmark,
  CostEstimate,
  DashboardPayload,
  ScenarioGroup,
  TokenAnalysis
} from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "db", "sustainable-energy.sqlite");

declare global {
  // eslint-disable-next-line no-var
  var sustainableEnergyDb: Database.Database | undefined;
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
    scalability: 9.0,
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
    scalability: 9.0,
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

function createDatabase() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS cloud_profiles (
      provider TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      hourly_cpu REAL NOT NULL,
      hourly_ram REAL NOT NULL,
      storage_monthly_gb REAL NOT NULL,
      egress_gb REAL NOT NULL,
      green_score INTEGER NOT NULL,
      carbon_intensity REAL NOT NULL,
      highlight TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_profiles (
      model_key TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      energy_per_thousand_tokens REAL NOT NULL,
      optimized_saving_pct REAL NOT NULL,
      carbon_grams_per_wh REAL NOT NULL,
      best_for TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS benchmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario TEXT NOT NULL,
      scenario_label TEXT NOT NULL,
      provider TEXT NOT NULL,
      monthly_cost REAL NOT NULL,
      scalability REAL NOT NULL,
      performance REAL NOT NULL,
      latency_ms REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cost_estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workload_name TEXT NOT NULL,
      provider TEXT NOT NULL,
      hours INTEGER NOT NULL,
      vcpu INTEGER NOT NULL,
      memory_gb INTEGER NOT NULL,
      storage_gb INTEGER NOT NULL,
      transfer_gb INTEGER NOT NULL,
      compute_cost REAL NOT NULL,
      storage_cost REAL NOT NULL,
      transfer_cost REAL NOT NULL,
      total_cost REAL NOT NULL,
      sustainability_score INTEGER NOT NULL,
      carbon_kg REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS token_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_key TEXT NOT NULL,
      prompt_tokens INTEGER NOT NULL,
      response_tokens INTEGER NOT NULL,
      daily_requests INTEGER NOT NULL,
      energy_wh REAL NOT NULL,
      carbon_grams REAL NOT NULL,
      optimized_energy_wh REAL NOT NULL,
      optimized_carbon_grams REAL NOT NULL,
      savings_pct REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDatabase(db);

  return db;
}

function seedDatabase(db: Database.Database) {
  const profileCount = db.prepare("SELECT COUNT(*) as count FROM cloud_profiles").get() as {
    count: number;
  };

  if (profileCount.count === 0) {
    const insertProfile = db.prepare(`
      INSERT INTO cloud_profiles (
        provider,
        display_name,
        hourly_cpu,
        hourly_ram,
        storage_monthly_gb,
        egress_gb,
        green_score,
        carbon_intensity,
        highlight
      ) VALUES (
        @provider,
        @displayName,
        @hourlyCpu,
        @hourlyRam,
        @storageMonthlyGb,
        @egressGb,
        @greenScore,
        @carbonIntensity,
        @highlight
      )
    `);

    const insertAiProfile = db.prepare(`
      INSERT INTO ai_profiles (
        model_key,
        label,
        energy_per_thousand_tokens,
        optimized_saving_pct,
        carbon_grams_per_wh,
        best_for
      ) VALUES (
        @modelKey,
        @label,
        @energyPerThousandTokens,
        @optimizedSavingPct,
        @carbonGramsPerWh,
        @bestFor
      )
    `);

    const insertBenchmark = db.prepare(`
      INSERT INTO benchmarks (
        scenario,
        scenario_label,
        provider,
        monthly_cost,
        scalability,
        performance,
        latency_ms
      ) VALUES (
        @scenario,
        @scenarioLabel,
        @provider,
        @monthlyCost,
        @scalability,
        @performance,
        @latencyMs
      )
    `);

    const seedTransaction = db.transaction(() => {
      for (const item of cloudSeed) {
        insertProfile.run(item);
      }

      for (const item of aiSeed) {
        insertAiProfile.run(item);
      }

      for (const item of benchmarkSeed) {
        insertBenchmark.run(item);
      }
    });

    seedTransaction();
  }
}

function getDatabase() {
  if (!globalThis.sustainableEnergyDb) {
    globalThis.sustainableEnergyDb = createDatabase();
  }

  return globalThis.sustainableEnergyDb;
}

export function getCloudProfiles(): CloudProfile[] {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT
        provider as provider,
        display_name as displayName,
        hourly_cpu as hourlyCpu,
        hourly_ram as hourlyRam,
        storage_monthly_gb as storageMonthlyGb,
        egress_gb as egressGb,
        green_score as greenScore,
        carbon_intensity as carbonIntensity,
        highlight as highlight
      FROM cloud_profiles
      ORDER BY green_score DESC, display_name ASC
    `)
    .all() as CloudProfile[];
}

export function getCloudProfile(provider: string): CloudProfile | undefined {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT
        provider as provider,
        display_name as displayName,
        hourly_cpu as hourlyCpu,
        hourly_ram as hourlyRam,
        storage_monthly_gb as storageMonthlyGb,
        egress_gb as egressGb,
        green_score as greenScore,
        carbon_intensity as carbonIntensity,
        highlight as highlight
      FROM cloud_profiles
      WHERE provider = ?
    `)
    .get(provider) as CloudProfile | undefined;
}

export function getAiProfiles(): AiProfile[] {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT
        model_key as modelKey,
        label as label,
        energy_per_thousand_tokens as energyPerThousandTokens,
        optimized_saving_pct as optimizedSavingPct,
        carbon_grams_per_wh as carbonGramsPerWh,
        best_for as bestFor
      FROM ai_profiles
      ORDER BY energy_per_thousand_tokens ASC
    `)
    .all() as AiProfile[];
}

export function getAiProfile(modelKey: string): AiProfile | undefined {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT
        model_key as modelKey,
        label as label,
        energy_per_thousand_tokens as energyPerThousandTokens,
        optimized_saving_pct as optimizedSavingPct,
        carbon_grams_per_wh as carbonGramsPerWh,
        best_for as bestFor
      FROM ai_profiles
      WHERE model_key = ?
    `)
    .get(modelKey) as AiProfile | undefined;
}

export function getBenchmarks(): ScenarioGroup[] {
  const db = getDatabase();

  const rows = db
    .prepare(`
      SELECT
        scenario as scenario,
        scenario_label as scenarioLabel,
        provider as provider,
        monthly_cost as monthlyCost,
        scalability as scalability,
        performance as performance,
        latency_ms as latencyMs
      FROM benchmarks
      ORDER BY scenario_label ASC, monthly_cost ASC
    `)
    .all() as ComparisonBenchmark[];

  const grouped = new Map<string, ScenarioGroup>();

  for (const row of rows) {
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

export function saveCostEstimate(input: Omit<CostEstimate, "id" | "createdAt">) {
  const db = getDatabase();

  db.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.workloadName,
    input.provider,
    input.hours,
    input.vcpu,
    input.memoryGb,
    input.storageGb,
    input.transferGb,
    input.computeCost,
    input.storageCost,
    input.transferCost,
    input.totalCost,
    input.sustainabilityScore,
    input.carbonKg
  );
}

export function saveTokenAnalysis(input: Omit<TokenAnalysis, "id" | "createdAt">) {
  const db = getDatabase();

  db.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.modelKey,
    input.promptTokens,
    input.responseTokens,
    input.dailyRequests,
    input.energyWh,
    input.carbonGrams,
    input.optimizedEnergyWh,
    input.optimizedCarbonGrams,
    input.savingsPct
  );
}

export function getRecentCostEstimates(limit = 5): CostEstimate[] {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT
        id as id,
        workload_name as workloadName,
        provider as provider,
        hours as hours,
        vcpu as vcpu,
        memory_gb as memoryGb,
        storage_gb as storageGb,
        transfer_gb as transferGb,
        compute_cost as computeCost,
        storage_cost as storageCost,
        transfer_cost as transferCost,
        total_cost as totalCost,
        sustainability_score as sustainabilityScore,
        carbon_kg as carbonKg,
        created_at as createdAt
      FROM cost_estimates
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ?
    `)
    .all(limit) as CostEstimate[];
}

export function getRecentTokenAnalyses(limit = 5): TokenAnalysis[] {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT
        id as id,
        model_key as modelKey,
        prompt_tokens as promptTokens,
        response_tokens as responseTokens,
        daily_requests as dailyRequests,
        energy_wh as energyWh,
        carbon_grams as carbonGrams,
        optimized_energy_wh as optimizedEnergyWh,
        optimized_carbon_grams as optimizedCarbonGrams,
        savings_pct as savingsPct,
        created_at as createdAt
      FROM token_analyses
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ?
    `)
    .all(limit) as TokenAnalysis[];
}

export function getDashboardPayload(): DashboardPayload {
  const providers = getCloudProfiles();
  const aiProfiles = getAiProfiles();
  const scenarios = getBenchmarks();
  const recentCosts = getRecentCostEstimates(4);
  const recentTokenAnalyses = getRecentTokenAnalyses(4);

  const averageGreenScore =
    providers.reduce((sum, item) => sum + item.greenScore, 0) / Math.max(providers.length, 1);
  const snapshotsLogged = recentCosts.length + recentTokenAnalyses.length;
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
