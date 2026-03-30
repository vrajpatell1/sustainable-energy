export type CloudProfile = {
  provider: string;
  displayName: string;
  hourlyCpu: number;
  hourlyRam: number;
  storageMonthlyGb: number;
  egressGb: number;
  greenScore: number;
  carbonIntensity: number;
  highlight: string;
};

export type AiProfile = {
  modelKey: string;
  label: string;
  energyPerThousandTokens: number;
  optimizedSavingPct: number;
  carbonGramsPerWh: number;
  bestFor: string;
};

export type ComparisonBenchmark = {
  scenario: string;
  scenarioLabel: string;
  provider: string;
  monthlyCost: number;
  scalability: number;
  performance: number;
  latencyMs: number;
};

export type CostEstimate = {
  id: number;
  workloadName: string;
  provider: string;
  hours: number;
  vcpu: number;
  memoryGb: number;
  storageGb: number;
  transferGb: number;
  computeCost: number;
  storageCost: number;
  transferCost: number;
  totalCost: number;
  sustainabilityScore: number;
  carbonKg: number;
  createdAt: string;
};

export type TokenAnalysis = {
  id: number;
  modelKey: string;
  promptTokens: number;
  responseTokens: number;
  dailyRequests: number;
  energyWh: number;
  carbonGrams: number;
  optimizedEnergyWh: number;
  optimizedCarbonGrams: number;
  savingsPct: number;
  createdAt: string;
};

export type CostCalculatorInput = {
  workloadName: string;
  provider: string;
  hours: number;
  vcpu: number;
  memoryGb: number;
  storageGb: number;
  transferGb: number;
};

export type CostCalculatorResult = {
  profile: CloudProfile;
  workloadName: string;
  computeCost: number;
  storageCost: number;
  transferCost: number;
  totalCost: number;
  monthlyKwh: number;
  carbonKg: number;
  sustainabilityScore: number;
  insights: string[];
};

export type TokenAnalysisInput = {
  modelKey: string;
  promptTokens: number;
  responseTokens: number;
  dailyRequests: number;
};

export type TokenAnalysisResult = {
  profile: AiProfile;
  totalTokensPerRequest: number;
  monthlyTokens: number;
  energyWh: number;
  carbonGrams: number;
  optimizedEnergyWh: number;
  optimizedCarbonGrams: number;
  annualSavingsKwh: number;
  annualSavingsKg: number;
  recommendations: string[];
};

export type ScenarioGroup = {
  scenario: string;
  scenarioLabel: string;
  entries: ComparisonBenchmark[];
};

export type DashboardPayload = {
  providers: CloudProfile[];
  aiProfiles: AiProfile[];
  scenarios: ScenarioGroup[];
  recentCosts: CostEstimate[];
  recentTokenAnalyses: TokenAnalysis[];
  overview: {
    providersTracked: number;
    averageGreenScore: number;
    snapshotsLogged: number;
    annualSavingsHeadline: string;
  };
};
