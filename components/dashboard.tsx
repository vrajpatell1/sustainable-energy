"use client";

import { useState } from "react";

import type {
  CostCalculatorResult,
  DashboardPayload,
  ScenarioGroup,
  TokenAnalysisResult
} from "@/lib/types";

type DashboardShellProps = {
  initialData: DashboardPayload;
};

type CostFormState = {
  workloadName: string;
  provider: string;
  hours: number;
  vcpu: number;
  memoryGb: number;
  storageGb: number;
  transferGb: number;
};

type TokenFormState = {
  modelKey: string;
  promptTokens: number;
  responseTokens: number;
  dailyRequests: number;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);

const providerAccent: Record<string, string> = {
  aws: "var(--accent-sun)",
  azure: "var(--accent-water)",
  gcp: "var(--accent-leaf)"
};

export function DashboardShell({ initialData }: DashboardShellProps) {
  const [dashboard, setDashboard] = useState(initialData);
  const [selectedScenario, setSelectedScenario] = useState(
    initialData.scenarios[0]?.scenario ?? "ecommerce"
  );
  const [costForm, setCostForm] = useState<CostFormState>({
    workloadName: "Campus Energy Portal",
    provider: initialData.providers[0]?.provider ?? "gcp",
    hours: 720,
    vcpu: 8,
    memoryGb: 16,
    storageGb: 180,
    transferGb: 320
  });
  const [tokenForm, setTokenForm] = useState<TokenFormState>({
    modelKey: initialData.aiProfiles[1]?.modelKey ?? "balanced",
    promptTokens: 1800,
    responseTokens: 900,
    dailyRequests: 450
  });
  const [costResult, setCostResult] = useState<CostCalculatorResult | null>(null);
  const [tokenResult, setTokenResult] = useState<TokenAnalysisResult | null>(null);
  const [costLoading, setCostLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const currentScenario =
    dashboard.scenarios.find((scenario) => scenario.scenario === selectedScenario) ??
    dashboard.scenarios[0];

  async function refreshDashboard() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });

    if (response.ok) {
      const nextData = (await response.json()) as DashboardPayload;
      setDashboard(nextData);
    }
  }

  async function handleCostSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCostLoading(true);
    setCostError(null);

    try {
      const response = await fetch("/api/calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(costForm)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not run the cloud cost calculation.");
      }

      setCostResult(payload as CostCalculatorResult);
      await refreshDashboard();
    } catch (error) {
      setCostError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setCostLoading(false);
    }
  }

  async function handleTokenSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTokenLoading(true);
    setTokenError(null);

    try {
      const response = await fetch("/api/token-lab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tokenForm)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not run the token sustainability analysis.");
      }

      setTokenResult(payload as TokenAnalysisResult);
      await refreshDashboard();
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setTokenLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Sustainable Energy Project</p>
          <h1>Efficient computing, cloud sustainability, and AI token impact in one public-ready platform.</h1>
          <p className="hero-text">
            This website turns your assignment brief into a working product with frontend, backend,
            and database support. It helps visitors estimate cloud cost, study AI energy usage,
            and compare providers for real-world workloads.
          </p>
          <div className="hero-actions">
            <a href="#calculator" className="primary-link">
              Explore the calculator
            </a>
            <a href="#comparison" className="secondary-link">
              Compare platforms
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="orbital-grid">
            <div className="overview-pill">
              <span>{dashboard.overview.providersTracked}</span>
              Providers tracked
            </div>
            <div className="overview-pill">
              <span>{dashboard.overview.averageGreenScore}</span>
              Avg green score
            </div>
            <div className="overview-pill wide">
              <span>{dashboard.overview.annualSavingsHeadline}</span>
            </div>
          </div>
          <div className="signal-card">
            <p>Live system snapshot</p>
            <strong>{dashboard.overview.snapshotsLogged} community calculations logged</strong>
            <small>
              Each estimate is saved to the database so the dashboard can show recent activity.
            </small>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p>Cloud Cost Calculation</p>
          <strong>Storage, compute, and transfer cost</strong>
          <span>Built for project requirement 2(a)</span>
        </article>
        <article className="stat-card">
          <p>Sustainable Tokens for AI</p>
          <strong>Energy and carbon impact</strong>
          <span>Built for project requirement 2(b)</span>
        </article>
        <article className="stat-card">
          <p>Platform Comparison</p>
          <strong>Pricing, scale, and performance</strong>
          <span>Built for project requirement 2(c)</span>
        </article>
      </section>

      <section className="feature-grid" id="calculator">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">a) Cloud Cost Calculation</p>
            <h2>Estimate monthly cost for a sustainable cloud workload</h2>
          </div>

          <form className="form-grid" onSubmit={handleCostSubmit}>
            <label>
              Workload name
              <input
                value={costForm.workloadName}
                onChange={(event) =>
                  setCostForm((current) => ({ ...current, workloadName: event.target.value }))
                }
                placeholder="Smart Meter Dashboard"
              />
            </label>

            <label>
              Provider
              <select
                value={costForm.provider}
                onChange={(event) =>
                  setCostForm((current) => ({ ...current, provider: event.target.value }))
                }
              >
                {dashboard.providers.map((provider) => (
                  <option key={provider.provider} value={provider.provider}>
                    {provider.displayName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Monthly hours
              <input
                type="number"
                min={1}
                value={costForm.hours}
                onChange={(event) =>
                  setCostForm((current) => ({ ...current, hours: Number(event.target.value) }))
                }
              />
            </label>

            <label>
              vCPU count
              <input
                type="number"
                min={1}
                value={costForm.vcpu}
                onChange={(event) =>
                  setCostForm((current) => ({ ...current, vcpu: Number(event.target.value) }))
                }
              />
            </label>

            <label>
              Memory (GB)
              <input
                type="number"
                min={1}
                value={costForm.memoryGb}
                onChange={(event) =>
                  setCostForm((current) => ({ ...current, memoryGb: Number(event.target.value) }))
                }
              />
            </label>

            <label>
              Storage (GB)
              <input
                type="number"
                min={0}
                value={costForm.storageGb}
                onChange={(event) =>
                  setCostForm((current) => ({ ...current, storageGb: Number(event.target.value) }))
                }
              />
            </label>

            <label>
              Data transfer (GB)
              <input
                type="number"
                min={0}
                value={costForm.transferGb}
                onChange={(event) =>
                  setCostForm((current) => ({
                    ...current,
                    transferGb: Number(event.target.value)
                  }))
                }
              />
            </label>

            <button className="primary-button" type="submit" disabled={costLoading}>
              {costLoading ? "Calculating..." : "Run cost analysis"}
            </button>
          </form>

          {costError ? <p className="error-text">{costError}</p> : null}

          <div className="result-panel">
            <div className="result-summary">
              <p>Latest cost estimate</p>
              <strong>{costResult ? formatMoney(costResult.totalCost) : "Run the calculator"}</strong>
              <span>
                {costResult
                  ? `${costResult.profile.displayName} for ${costResult.workloadName}`
                  : "The backend will save every estimate to the database."}
              </span>
            </div>

            <div className="mini-metrics">
              <div>
                <p>Compute</p>
                <strong>{costResult ? formatMoney(costResult.computeCost) : "$0"}</strong>
              </div>
              <div>
                <p>Storage</p>
                <strong>{costResult ? formatMoney(costResult.storageCost) : "$0"}</strong>
              </div>
              <div>
                <p>Transfer</p>
                <strong>{costResult ? formatMoney(costResult.transferCost) : "$0"}</strong>
              </div>
              <div>
                <p>Carbon</p>
                <strong>{costResult ? `${costResult.carbonKg} kg` : "0 kg"}</strong>
              </div>
            </div>

            <ul className="insight-list">
              {(costResult?.insights ?? [
                "Use the form to compare provider cost and sustainability trade-offs.",
                "The API separates compute, storage, and transfer cost for a clearer report.",
                "Each submission becomes a saved record for the recent activity feed."
              ]).map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">b) Sustainable Tokens for AI</p>
            <h2>Model how token choices influence energy consumption</h2>
          </div>

          <form className="form-grid" onSubmit={handleTokenSubmit}>
            <label>
              Model profile
              <select
                value={tokenForm.modelKey}
                onChange={(event) =>
                  setTokenForm((current) => ({ ...current, modelKey: event.target.value }))
                }
              >
                {dashboard.aiProfiles.map((profile) => (
                  <option key={profile.modelKey} value={profile.modelKey}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Prompt tokens
              <input
                type="number"
                min={1}
                value={tokenForm.promptTokens}
                onChange={(event) =>
                  setTokenForm((current) => ({
                    ...current,
                    promptTokens: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label>
              Response tokens
              <input
                type="number"
                min={1}
                value={tokenForm.responseTokens}
                onChange={(event) =>
                  setTokenForm((current) => ({
                    ...current,
                    responseTokens: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label>
              Daily requests
              <input
                type="number"
                min={1}
                value={tokenForm.dailyRequests}
                onChange={(event) =>
                  setTokenForm((current) => ({
                    ...current,
                    dailyRequests: Number(event.target.value)
                  }))
                }
              />
            </label>

            <button className="primary-button" type="submit" disabled={tokenLoading}>
              {tokenLoading ? "Analyzing..." : "Analyze token impact"}
            </button>
          </form>

          {tokenError ? <p className="error-text">{tokenError}</p> : null}

          <div className="result-panel">
            <div className="result-summary">
              <p>Latest token analysis</p>
              <strong>{tokenResult ? `${formatCompact(tokenResult.monthlyTokens)} tokens/month` : "Ready for analysis"}</strong>
              <span>
                {tokenResult
                  ? `${tokenResult.profile.label} with ${tokenResult.totalTokensPerRequest} tokens per request`
                  : "Run the analysis to estimate energy, carbon, and optimization savings."}
              </span>
            </div>

            <div className="mini-metrics">
              <div>
                <p>Energy</p>
                <strong>{tokenResult ? `${tokenResult.energyWh} Wh` : "0 Wh"}</strong>
              </div>
              <div>
                <p>Carbon</p>
                <strong>{tokenResult ? `${tokenResult.carbonGrams} g` : "0 g"}</strong>
              </div>
              <div>
                <p>Optimized</p>
                <strong>{tokenResult ? `${tokenResult.optimizedEnergyWh} Wh` : "0 Wh"}</strong>
              </div>
              <div>
                <p>Annual savings</p>
                <strong>{tokenResult ? `${tokenResult.annualSavingsKg} kg CO2` : "0 kg"}</strong>
              </div>
            </div>

            <ul className="insight-list">
              {(tokenResult?.recommendations ?? [
                "Shorter prompts and structured outputs can lower token waste significantly.",
                "Caching repeated requests cuts both cost and energy for high-volume workloads.",
                "Small models for simple tasks create measurable sustainability gains."
              ]).map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="provider-strip">
        {dashboard.providers.map((provider) => (
          <article
            key={provider.provider}
            className="provider-card"
            style={{ borderColor: providerAccent[provider.provider] ?? "var(--line)" }}
          >
            <div>
              <p>{provider.displayName}</p>
              <strong>{provider.greenScore}/100 green score</strong>
            </div>
            <span>{provider.highlight}</span>
          </article>
        ))}
      </section>

      <section className="comparison-section" id="comparison">
        <div className="panel-heading">
          <p className="eyebrow">c) Comparison of Cloud Cost Software</p>
          <h2>Compare providers for real-world system patterns</h2>
        </div>

        <div className="scenario-tabs">
          {dashboard.scenarios.map((scenario) => (
            <button
              key={scenario.scenario}
              type="button"
              className={scenario.scenario === selectedScenario ? "tab active" : "tab"}
              onClick={() => setSelectedScenario(scenario.scenario)}
            >
              {scenario.scenarioLabel}
            </button>
          ))}
        </div>

        {currentScenario ? <ScenarioBoard scenario={currentScenario} /> : null}
      </section>

      <section className="activity-grid">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Recent Cloud Estimates</p>
            <h2>Saved from the backend into the database</h2>
          </div>
          <div className="activity-list">
            {dashboard.recentCosts.length > 0 ? (
              dashboard.recentCosts.map((item) => (
                <div key={item.id} className="activity-item">
                  <strong>{item.workloadName}</strong>
                  <span>
                    {item.provider.toUpperCase()} · {formatMoney(item.totalCost)} · {item.carbonKg} kg CO2
                  </span>
                </div>
              ))
            ) : (
              <p className="muted-text">Run the calculator to start storing snapshots.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Recent Token Studies</p>
            <h2>Optimization history from the token lab</h2>
          </div>
          <div className="activity-list">
            {dashboard.recentTokenAnalyses.length > 0 ? (
              dashboard.recentTokenAnalyses.map((item) => (
                <div key={item.id} className="activity-item">
                  <strong>{item.modelKey.toUpperCase()} model profile</strong>
                  <span>
                    {formatCompact(item.promptTokens + item.responseTokens)} tokens/request ·{" "}
                    {item.optimizedEnergyWh} Wh optimized
                  </span>
                </div>
              ))
            ) : (
              <p className="muted-text">Run the token analysis to populate this section.</p>
            )}
          </div>
        </article>
      </section>

      <section className="method-grid">
        <article className="method-card">
          <p className="eyebrow">Frontend</p>
          <h3>Interactive dashboard</h3>
          <span>Responsive Next.js interface with custom visuals, forms, and live comparison views.</span>
        </article>
        <article className="method-card">
          <p className="eyebrow">Backend</p>
          <h3>API routes</h3>
          <span>Server-side calculation endpoints for cloud estimation, token analysis, and dashboard data.</span>
        </article>
        <article className="method-card">
          <p className="eyebrow">Database</p>
          <h3>SQLite persistence</h3>
          <span>Seeded provider data plus saved user calculations for recent activity and reporting.</span>
        </article>
        <article className="method-card">
          <p className="eyebrow">Hosting</p>
          <h3>Public deployment ready</h3>
          <span>Docker and Render config included so the app can be published on a public URL.</span>
        </article>
      </section>
    </main>
  );
}

function ScenarioBoard({ scenario }: { scenario: ScenarioGroup }) {
  const highestCost = Math.max(...scenario.entries.map((item) => item.monthlyCost));

  return (
    <div className="scenario-board">
      <div className="chart-stack">
        {scenario.entries.map((entry) => {
          const width = `${(entry.monthlyCost / highestCost) * 100}%`;

          return (
            <div className="chart-row" key={`${scenario.scenario}-${entry.provider}`}>
              <div className="chart-label">
                <strong>{entry.provider.toUpperCase()}</strong>
                <span>{formatMoney(entry.monthlyCost)}</span>
              </div>
              <div className="chart-track">
                <div
                  className="chart-fill"
                  style={{
                    width,
                    background:
                      providerAccent[entry.provider] ??
                      "linear-gradient(90deg, var(--accent-leaf), var(--accent-water))"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="comparison-table">
        {scenario.entries.map((entry) => (
          <div key={entry.provider} className="comparison-card">
            <p>{entry.provider.toUpperCase()}</p>
            <strong>{formatMoney(entry.monthlyCost)}</strong>
            <span>Scalability {entry.scalability}/10</span>
            <span>Performance {entry.performance}/10</span>
            <span>Latency {entry.latencyMs} ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
