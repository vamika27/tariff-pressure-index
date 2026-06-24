"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import rawCompanies from "../data/companies.json";

type RiskBucket = "Low" | "Medium" | "High";

type Company = {
  ticker: string;
  company_name: string;
  sector: string;
  sub_industry: string;
  gross_margin: number;
  import_dependency_ratio: number;
  affected_region_revenue_share: number;
  tariff_pressure_score: number;
  risk_bucket: RiskBucket;
};

type SortKey = keyof Company;

type SortState = {
  key: SortKey;
  direction: "asc" | "desc";
};

const companies = rawCompanies as Company[];

const riskOrder: RiskBucket[] = ["Low", "Medium", "High"];

const riskStyles: Record<
  RiskBucket,
  { color: string; soft: string; label: string; range: string }
> = {
  Low: {
    color: "#A8BFA0",
    soft: "rgba(168, 191, 160, 0.26)",
    label: "Low risk",
    range: "0-33"
  },
  Medium: {
    color: "#E0A85F",
    soft: "rgba(224, 168, 95, 0.25)",
    label: "Medium risk",
    range: "34-66"
  },
  High: {
    color: "#C1654A",
    soft: "rgba(193, 101, 74, 0.24)",
    label: "High risk",
    range: "67-100"
  }
};

const scoreBands = [
  { name: "Low", start: 0, end: 33, color: riskStyles.Low.color },
  { name: "Medium", start: 34, end: 66, color: riskStyles.Medium.color },
  { name: "High", start: 67, end: 100, color: riskStyles.High.color }
] as const;

const githubRepoUrl = "https://github.com/vamika27/tariff-pressure-index";
const powerBiUrl =
  "https://app.powerbi.com/links/dEwMGO2Lzo?ctid=41f88ecb-ca63-404d-97dd-ab0a169fd138&pbi_source=linkShare&bookmarkGuid=017ffc84-48d3-4ea8-9530-f48a37c4c05a";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(value * 100 >= 10 ? 0 : 1)}%`;
}

function formatShare(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function getCompanyOpacity(company: Company, activeRisk: RiskBucket | null) {
  return !activeRisk || company.risk_bucket === activeRisk ? 1 : 0.23;
}

function RiskBadge({
  risk,
  activeRisk,
  onSelect,
  count,
  compact = false
}: {
  risk: RiskBucket;
  activeRisk: RiskBucket | null;
  onSelect: (risk: RiskBucket) => void;
  count?: number;
  compact?: boolean;
}) {
  const isActive = activeRisk === risk;

  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => onSelect(risk)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold text-coffee shadow-sm transition ${
        isActive
          ? "border-coffee bg-oat shadow-soft"
          : "border-transparent bg-oat/70 hover:border-latte"
      } ${compact ? "px-2.5 py-1 text-xs" : ""}`}
      title={`Filter and highlight ${riskStyles[risk].label}`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: riskStyles[risk].color }}
        aria-hidden="true"
      />
      {risk}
      {typeof count === "number" ? (
        <span className="rounded-full bg-cream px-2 py-0.5 text-xs">{count}</span>
      ) : null}
    </button>
  );
}

function RiskFilterLegend({
  activeRisk,
  onSelect,
  counts
}: {
  activeRisk: RiskBucket | null;
  onSelect: (risk: RiskBucket) => void;
  counts: Record<RiskBucket, number>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Risk bucket filters">
      {riskOrder.map((risk) => (
        <RiskBadge
          key={risk}
          risk={risk}
          activeRisk={activeRisk}
          onSelect={onSelect}
          count={counts[risk]}
        />
      ))}
      {activeRisk ? (
        <button
          type="button"
          onClick={() => onSelect(activeRisk)}
          className="rounded-full border border-latte bg-transparent px-3 py-1.5 text-sm font-bold text-coffee/75 hover:bg-oat"
        >
          Clear filter
        </button>
      ) : null}
    </div>
  );
}

function ScoreBandLegend() {
  return (
    <div className="rounded-2xl border border-latte/60 bg-cream/70 p-3">
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-coffee/60">
        <span>Tariff Pressure Score scale</span>
        <span>0 to 100</span>
      </div>
      <div className="grid overflow-hidden rounded-full border border-oat shadow-sm sm:grid-cols-[33fr_33fr_34fr]">
        {scoreBands.map((band) => (
          <div
            key={band.name}
            className="px-3 py-2 text-center text-xs font-extrabold text-coffee"
            style={{ backgroundColor: `${band.color}66` }}
          >
            {band.name} {band.start}-{band.end}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ payload: Company }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const company = payload[0].payload;

  return (
    <div className="max-w-xs rounded-3xl border border-latte/60 bg-oat/95 p-4 text-sm text-coffee shadow-cozy backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: riskStyles[company.risk_bucket].color }}
          aria-hidden="true"
        />
        <p className="font-display text-base font-extrabold">
          {company.company_name} ({company.ticker})
        </p>
      </div>
      <dl className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <dt>Score on 0-100 scale</dt>
          <dd className="font-bold">{company.tariff_pressure_score.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Gross margin shock absorber</dt>
          <dd className="font-bold">{formatPercent(company.gross_margin)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Inputs sourced internationally</dt>
          <dd className="font-bold">{formatPercent(company.import_dependency_ratio)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Revenue from affected regions</dt>
          <dd className="font-bold">
            {formatShare(company.affected_region_revenue_share)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function RiskDistributionTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: RiskBucket;
      value: number;
      percentage: number;
      companies: Company[];
    };
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const bucket = payload[0].payload;

  return (
    <div className="max-w-sm rounded-3xl border border-latte/60 bg-oat/95 p-4 text-sm text-coffee shadow-cozy backdrop-blur">
      <p className="font-display text-base font-extrabold">
        {bucket.name} risk: {bucket.value} companies ({bucket.percentage.toFixed(1)}%)
      </p>
      <p className="mt-1 text-coffee/70">
        Companies in this slice, with their 0-100 score:
      </p>
      <div className="mt-3 grid max-h-48 grid-cols-2 gap-2 overflow-auto pr-1">
        {bucket.companies.map((company) => (
          <span
            key={company.ticker}
            className="rounded-2xl bg-cream px-2 py-1 text-xs font-bold"
          >
            {company.ticker}: {company.tariff_pressure_score.toFixed(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  caption
}: {
  eyebrow: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-coffee/50">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl font-extrabold text-coffee md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-coffee/70 md:text-base">
        {caption}
      </p>
    </div>
  );
}

function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`chart-card rounded-cozy border border-oat/80 bg-oat/90 p-5 shadow-cozy md:p-7 ${className}`}
    >
      {children}
    </section>
  );
}

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-cozy border border-dashed border-latte/70 bg-cream/50 text-center text-sm font-bold text-coffee/60">
      {label}
    </div>
  );
}

export default function Home() {
  const [chartsReady, setChartsReady] = useState(false);
  const [activeRisk, setActiveRisk] = useState<RiskBucket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [sortState, setSortState] = useState<SortState>({
    key: "tariff_pressure_score",
    direction: "desc"
  });

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const riskCounts = useMemo(
    () =>
      riskOrder.reduce(
        (acc, risk) => {
          acc[risk] = companies.filter((company) => company.risk_bucket === risk).length;
          return acc;
        },
        { Low: 0, Medium: 0, High: 0 } as Record<RiskBucket, number>
      ),
    []
  );

  const sectors = useMemo(
    () => ["All sectors", ...Array.from(new Set(companies.map((company) => company.sector))).sort()],
    []
  );

  const topTenCompanies = useMemo(
    () =>
      [...companies]
        .sort((a, b) => b.tariff_pressure_score - a.tariff_pressure_score)
        .slice(0, 10),
    []
  );

  const riskDistribution = useMemo(
    () =>
      riskOrder.map((risk) => {
        const companiesInBucket = companies.filter((company) => company.risk_bucket === risk);

        return {
          name: risk,
          value: companiesInBucket.length,
          percentage: (companiesInBucket.length / companies.length) * 100,
          companies: companiesInBucket
        };
      }),
    []
  );

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return companies
      .filter((company) => {
        const matchesRisk = !activeRisk || company.risk_bucket === activeRisk;
        const matchesSector =
          sectorFilter === "All sectors" || company.sector === sectorFilter;
        const matchesSearch =
          !normalizedSearch ||
          company.ticker.toLowerCase().includes(normalizedSearch) ||
          company.company_name.toLowerCase().includes(normalizedSearch);

        return matchesRisk && matchesSector && matchesSearch;
      })
      .sort((a, b) => {
        const aValue = a[sortState.key];
        const bValue = b[sortState.key];

        let comparison = 0;

        if (sortState.key === "risk_bucket") {
          comparison =
            riskOrder.indexOf(aValue as RiskBucket) -
            riskOrder.indexOf(bValue as RiskBucket);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortState.direction === "asc" ? comparison : -comparison;
      });
  }, [activeRisk, searchTerm, sectorFilter, sortState]);

  function handleRiskSelect(risk: RiskBucket) {
    setActiveRisk((currentRisk) => (currentRisk === risk ? null : risk));
  }

  function handleSort(key: SortKey) {
    setSortState((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === "desc" ? "asc" : "desc"
    }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-[2rem] border border-oat/80 bg-oat/90 p-6 shadow-cozy md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-latte/40 px-4 py-2 text-sm font-extrabold text-coffee">
              Cozy trade-risk dashboard
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-coffee sm:text-5xl md:text-6xl">
              Tariff Pressure Index
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-coffee/75">
              Which S&amp;P 500 companies are most exposed to global trade
              disruption — and why
            </p>
          </div>
          <div className="rounded-cozy border border-latte/50 bg-cream/80 p-4 text-sm leading-6 text-coffee/75">
            <p className="font-bold text-coffee">Score methodology</p>
            <p className="mt-2">
              The Tariff Pressure Score is the average of three 0–1 normalized
              components — (1) gross margin vulnerability (inverse of gross
              margin: thinner margins = less shock absorption), (2) import
              dependency ratio, and (3) international/affected-region revenue
              share — scaled to 0–100. Risk buckets: <strong>Low = 0–33</strong>,{" "}
              <strong>Medium = 34–66</strong>, <strong>High = 67–100</strong>.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["23", "companies analyzed"],
            ["22x", "risk gap between highest (Aptiv) and lowest (Adobe) exposure"],
            ["91.3%", "of companies carry latent Medium risk"]
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-cozy border border-latte/50 bg-cream/75 p-5 shadow-soft"
            >
              <p className="font-display text-3xl font-extrabold text-coffee">
                {value}
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-coffee/70">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 rounded-cozy border border-latte/50 bg-cream/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-coffee">Cross-filter by risk bucket</p>
            <p className="text-sm text-coffee/70">
              Click a badge here, in a chart legend, or in the table to spotlight
              that risk level everywhere.
            </p>
          </div>
          <RiskFilterLegend
            activeRisk={activeRisk}
            onSelect={handleRiskSelect}
            counts={riskCounts}
          />
        </div>
      </header>

      <Card>
        <SectionHeading
          eyebrow="Top exposed names"
          title="Top 10 Companies by Tariff Pressure Score"
          caption="The longest bars sit closest to the High band on the 0-100 scale, so the score reads like a risk thermometer rather than an abstract number."
        />
        <ScoreBandLegend />
        <div className="mt-6 h-[520px] w-full">
          {chartsReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topTenCompanies}
              layout="vertical"
              margin={{ top: 8, right: 28, left: 18, bottom: 56 }}
              barCategoryGap={14}
            >
              <CartesianGrid stroke="#D8C3A5" strokeDasharray="4 6" opacity={0.46} />
              {scoreBands.map((band) => (
                <ReferenceArea
                  key={band.name}
                  x1={band.start}
                  x2={band.end}
                  strokeOpacity={0}
                  fill={band.color}
                  fillOpacity={0.1}
                />
              ))}
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 33, 66, 100]}
                tick={{ fill: "#5C4632", fontSize: 12, fontWeight: 700 }}
                axisLine={{ stroke: "#D8C3A5" }}
                tickLine={{ stroke: "#D8C3A5" }}
              >
                <Label
                  value="Tariff Pressure Score: 0 = low pressure, 100 = highest pressure"
                  offset={-36}
                  position="insideBottom"
                  fill="#5C4632"
                  fontSize={13}
                  fontWeight={700}
                />
              </XAxis>
              <YAxis
                type="category"
                dataKey="ticker"
                width={62}
                tick={{ fill: "#5C4632", fontSize: 13, fontWeight: 800 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CompanyTooltip />} cursor={{ fill: "rgba(92,70,50,0.06)" }} />
              <Bar
                dataKey="tariff_pressure_score"
                radius={[0, 16, 16, 0]}
                isAnimationActive
                animationDuration={750}
              >
                {topTenCompanies.map((company) => (
                  <Cell
                    key={company.ticker}
                    fill={riskStyles[company.risk_bucket].color}
                    fillOpacity={getCompanyOpacity(company, activeRisk)}
                    stroke={activeRisk === company.risk_bucket ? "#5C4632" : "transparent"}
                    strokeWidth={activeRisk === company.risk_bucket ? 1.5 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <ChartPlaceholder label="Loading the 0-100 score chart..." />
          )}
        </div>
      </Card>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <SectionHeading
            eyebrow="Two pressures at once"
            title="Trade Dependency vs Tariff Risk"
            caption="Companies in the upper-right depend heavily on imports and sit higher on the tariff-pressure scale; bigger bubbles mean more revenue from regions affected by tariffs."
          />
          <div className="mb-3 flex flex-wrap gap-3 text-sm font-bold text-coffee/75">
            <span className="rounded-full bg-cream px-3 py-1.5">
              x-axis: % of inputs sourced internationally
            </span>
            <span className="rounded-full bg-cream px-3 py-1.5">
              y-axis: score from 0 low pressure to 100 high pressure
            </span>
            <span className="rounded-full bg-cream px-3 py-1.5">
              bigger bubble = more international revenue exposure
            </span>
          </div>
          <div className="h-[470px] w-full">
            {chartsReady ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 26, left: 8, bottom: 58 }}>
                <CartesianGrid stroke="#D8C3A5" strokeDasharray="4 6" opacity={0.5} />
                <XAxis
                  dataKey="import_dependency_ratio"
                  type="number"
                  domain={[0, 1]}
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                  tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`}
                  tick={{ fill: "#5C4632", fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: "#D8C3A5" }}
                  tickLine={{ stroke: "#D8C3A5" }}
                >
                  <Label
                    value="% of inputs sourced internationally"
                    offset={-38}
                    position="insideBottom"
                    fill="#5C4632"
                    fontSize={13}
                    fontWeight={700}
                  />
                </XAxis>
                <YAxis
                  dataKey="tariff_pressure_score"
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 33, 66, 100]}
                  tick={{ fill: "#5C4632", fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: "#D8C3A5" }}
                  tickLine={{ stroke: "#D8C3A5" }}
                >
                  <Label
                    value="Tariff Pressure Score (0 low - 100 high)"
                    angle={-90}
                    position="insideLeft"
                    fill="#5C4632"
                    fontSize={13}
                    fontWeight={700}
                    style={{ textAnchor: "middle" }}
                  />
                </YAxis>
                <ZAxis
                  dataKey="affected_region_revenue_share"
                  type="number"
                  range={[90, 950]}
                />
                <Tooltip content={<CompanyTooltip />} cursor={{ stroke: "#5C4632", strokeOpacity: 0.25 }} />
                <Scatter data={companies} isAnimationActive animationDuration={850}>
                  {companies.map((company) => (
                    <Cell
                      key={company.ticker}
                      fill={riskStyles[company.risk_bucket].color}
                      fillOpacity={getCompanyOpacity(company, activeRisk) * 0.88}
                      stroke={activeRisk === company.risk_bucket ? "#5C4632" : "#FBF7F0"}
                      strokeWidth={activeRisk === company.risk_bucket ? 2.5 : 1.3}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            ) : (
              <ChartPlaceholder label="Loading the dependency bubble chart..." />
            )}
          </div>
          <RiskFilterLegend
            activeRisk={activeRisk}
            onSelect={handleRiskSelect}
            counts={riskCounts}
          />
        </Card>

        <Card>
          <SectionHeading
            eyebrow="Risk mix"
            title="Risk Distribution by Sector"
            caption="This donut counts companies by Low, Medium, and High risk bucket, with each hover revealing the company-level scores inside that bucket."
          />
          <div className="h-[330px] w-full">
            {chartsReady ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="52%"
                  outerRadius="78%"
                  paddingAngle={4}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                  }
                  isAnimationActive
                  animationDuration={850}
                >
                  {riskDistribution.map((bucket) => (
                    <Cell
                      key={bucket.name}
                      fill={riskStyles[bucket.name].color}
                      fillOpacity={!activeRisk || activeRisk === bucket.name ? 0.96 : 0.25}
                      stroke="#FBF7F0"
                      strokeWidth={4}
                      onClick={() => handleRiskSelect(bucket.name)}
                      className="cursor-pointer outline-none transition-opacity duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<RiskDistributionTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <ChartPlaceholder label="Loading the risk distribution donut..." />
            )}
          </div>
          <RiskFilterLegend
            activeRisk={activeRisk}
            onSelect={handleRiskSelect}
            counts={riskCounts}
          />
          <p className="mt-5 rounded-cozy bg-cream/80 p-4 text-sm font-bold leading-6 text-coffee/75">
            Plain-English takeaway: 91.3% of the companies sit in the Medium bucket,
            which means tariff exposure is broad and latent even when only Aptiv
            crosses into High risk.
          </p>
        </Card>
      </div>

      <Card>
        <SectionHeading
          eyebrow="Company details"
          title="Full Company Breakdown"
          caption="Search by ticker or company name, filter by sector, click any column header to sort, and use the risk pills to cross-filter the full dashboard."
        />
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_260px]">
          <label className="flex flex-col gap-2 text-sm font-bold text-coffee/75">
            Search ticker or company name
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Try APTV, Adobe, Apple..."
              className="rounded-2xl border border-latte/70 bg-cream px-4 py-3 text-coffee outline-none transition focus:border-coffee focus:ring-4 focus:ring-latte/30"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-coffee/75">
            Sector filter
            <select
              value={sectorFilter}
              onChange={(event) => setSectorFilter(event.target.value)}
              className="rounded-2xl border border-latte/70 bg-cream px-4 py-3 text-coffee outline-none transition focus:border-coffee focus:ring-4 focus:ring-latte/30"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-coffee/70">
            Showing {filteredCompanies.length} of {companies.length} companies
            {activeRisk ? ` in the ${activeRisk} risk bucket` : ""}.
          </p>
          <RiskFilterLegend
            activeRisk={activeRisk}
            onSelect={handleRiskSelect}
            counts={riskCounts}
          />
        </div>

        <div className="overflow-hidden rounded-cozy border border-latte/50">
          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full border-collapse bg-cream/70 text-left text-sm">
              <thead className="bg-latte/40 text-xs uppercase tracking-[0.14em] text-coffee/70">
                <tr>
                  {[
                    ["ticker", "Ticker"],
                    ["company_name", "Company"],
                    ["sector", "Sector"],
                    ["sub_industry", "Sub-industry"],
                    ["gross_margin", "Gross margin"],
                    ["import_dependency_ratio", "Import dependency"],
                    ["affected_region_revenue_share", "Affected revenue"],
                    ["tariff_pressure_score", "Score"],
                    ["risk_bucket", "Risk"]
                  ].map(([key, label]) => (
                    <th key={key} className="border-b border-latte/60 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort(key as SortKey)}
                        className="flex items-center gap-1 font-extrabold hover:text-coffee"
                      >
                        {label}
                        <span aria-hidden="true">
                          {sortState.key === key
                            ? sortState.direction === "asc"
                              ? "up"
                              : "down"
                            : "sort"}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr
                    key={company.ticker}
                    className="border-b border-latte/40 transition duration-200 hover:bg-oat"
                  >
                    <td className="px-4 py-3 font-extrabold">{company.ticker}</td>
                    <td className="px-4 py-3 font-bold">{company.company_name}</td>
                    <td className="px-4 py-3 text-coffee/75">{company.sector}</td>
                    <td className="px-4 py-3 text-coffee/70">{company.sub_industry}</td>
                    <td className="px-4 py-3 font-bold">
                      {formatPercent(company.gross_margin)}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {formatPercent(company.import_dependency_ratio)}
                      <span className="block text-xs font-normal text-coffee/50">
                        of inputs sourced internationally
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {formatShare(company.affected_region_revenue_share)}
                      <span className="block text-xs font-normal text-coffee/50">
                        of revenue from affected regions
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold">
                      {company.tariff_pressure_score.toFixed(2)}
                      <span className="block text-xs font-normal text-coffee/50">
                        on 0-100 risk scale
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge
                        risk={company.risk_bucket}
                        activeRisk={activeRisk}
                        onSelect={handleRiskSelect}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Import dependency is the strongest driver",
            text: "Companies that source 60-80% of inputs internationally cluster higher on the score scale because tariffs land directly in their cost structure."
          },
          {
            title: "International revenue amplifies the story",
            text: "High affected-region revenue can add pressure even when import dependency is not the only issue; Colgate and Cisco show how revenue exposure matters."
          },
          {
            title: "Gross margin is the shock absorber",
            text: "Adobe's roughly 89% gross margin gives it far more room to absorb disruption than Aptiv's roughly 6% margin, which helps explain the risk gap."
          }
        ].map((insight) => (
          <article
            key={insight.title}
            className="chart-card rounded-cozy border border-oat/80 bg-oat/90 p-6 shadow-soft"
          >
            <p className="mb-3 inline-flex rounded-full bg-latte/40 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-coffee/60">
              What drives risk
            </p>
            <h3 className="font-display text-xl font-extrabold text-coffee">
              {insight.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-coffee/70">{insight.text}</p>
          </article>
        ))}
      </section>

      <footer className="mb-4 rounded-[2rem] border border-latte/50 bg-oat/75 p-6 text-center text-sm font-bold text-coffee/70 shadow-soft">
        <p>Vamika Negi — Computer Science, Arizona State University</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <a
            href={githubRepoUrl}
            className="rounded-full bg-cream px-4 py-2 text-coffee transition hover:bg-latte/40"
          >
            GitHub repo
          </a>
          <a
            href={powerBiUrl}
            className="rounded-full bg-cream px-4 py-2 text-coffee transition hover:bg-latte/40"
          >
            Live Power BI dashboard
          </a>
        </div>
      </footer>
    </main>
  );
}
