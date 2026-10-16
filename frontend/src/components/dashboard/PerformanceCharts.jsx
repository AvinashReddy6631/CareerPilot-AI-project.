import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

const formatDate = (value, options = { month: "short", day: "numeric" }) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, options).format(date);
};

const formatScore = (value, suffix) =>
  Number.isFinite(value) ? `${value}${suffix}` : "—";

const getVisibleLabels = (points) => {
  if (points.length <= 3) return points;
  return [points[0], points[Math.floor(points.length / 2)], points.at(-1)];
};

function EmptyChart({ title, description, to, actionLabel }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-5 py-7 text-center dark:border-slate-700">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
      <Link to={to} className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-300">
        {actionLabel} →
      </Link>
    </div>
  );
}

function ChartTooltip({ point, detail, suffix }) {
  if (!point) return null;

  return (
    <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/70" role="status">
      <span className="font-semibold text-slate-900 dark:text-white">{formatScore(point.value, suffix)}</span>
      <span className="ml-1.5 text-slate-500 dark:text-slate-400">on {formatDate(point.occurredAt, { month: "short", day: "numeric", year: "numeric" })}</span>
      {detail && <span className="block truncate pt-0.5 text-slate-400">{detail}</span>}
    </div>
  );
}

function InterviewLineChart({ points }) {
  const [activeId, setActiveId] = useState(null);
  const width = 100;
  const height = 48;
  const padding = 5;
  const chartPoints = useMemo(
    () => points.map((point, index) => {
      const x = points.length === 1
        ? width / 2
        : padding + (index / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - (point.value / 10) * (height - padding * 2);
      return { ...point, x, y };
    }),
    [points]
  );
  const activePoint = chartPoints.find((point) => point.id === activeId) || chartPoints.at(-1);
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = [
    `${chartPoints[0]?.x || padding},${height - padding}`,
    ...chartPoints.map((point) => `${point.x},${point.y}`),
    `${chartPoints.at(-1)?.x || width - padding},${height - padding}`,
  ].join(" ");

  return (
    <>
      <div className="h-32">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none" aria-label="Interview scores over time" role="img">
          <defs>
            <linearGradient id="interviewChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M ${padding} ${height - padding} H ${width - padding}`} stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.4" />
          {chartPoints.length > 1 && <polygon points={areaPoints} fill="url(#interviewChartGradient)" />}
          {chartPoints.length > 1 && (
            <polyline
              points={linePoints}
              fill="none"
              stroke="var(--chart-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {chartPoints.map((point) => (
            <circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r={point.id === activePoint?.id ? "2.8" : "2"}
              fill="var(--chart-primary)"
              className="cursor-pointer outline-none"
              tabIndex="0"
              role="button"
              aria-label={`${point.value} out of 10 on ${formatDate(point.occurredAt)}`}
              onMouseEnter={() => setActiveId(point.id)}
              onFocus={() => setActiveId(point.id)}
            >
              <title>{`${point.value}/10 · ${formatDate(point.occurredAt, { month: "short", day: "numeric", year: "numeric" })}`}</title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="mt-1 flex justify-between gap-2">
        {getVisibleLabels(chartPoints).map((point) => (
          <span key={point.id} className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(point.occurredAt)}</span>
        ))}
      </div>
      <ChartTooltip point={activePoint} detail={activePoint?.role} suffix="/10" />
    </>
  );
}

function AtsBarChart({ points }) {
  const [activeId, setActiveId] = useState(null);
  const activePoint = points.find((point) => point.id === activeId) || points.at(-1);

  return (
    <>
      <div className="flex h-32 items-end gap-1.5 sm:gap-2">
        {points.map((point) => (
          <button
            key={point.id}
            type="button"
            aria-label={`${point.value}% on ${formatDate(point.occurredAt)}`}
            onMouseEnter={() => setActiveId(point.id)}
            onFocus={() => setActiveId(point.id)}
            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className={`text-[10px] font-semibold ${point.id === activePoint?.id ? "text-brand-600 dark:text-brand-300" : "text-slate-500 dark:text-slate-400"}`}>{point.value}%</span>
            <span className="w-full rounded-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-200 dark:from-brand-500 dark:to-brand-300" style={{ height: `${point.value}%` }} />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between gap-2">
        {getVisibleLabels(points).map((point) => (
          <span key={point.id} className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(point.occurredAt)}</span>
        ))}
      </div>
      <ChartTooltip point={activePoint} detail={activePoint?.fileName} suffix="%" />
    </>
  );
}

function LoadingChart() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function PerformanceCharts({ analytics, loading = false, error = "", range = "30d", onRangeChange, onRetry }) {
  const interview = analytics?.interview || {};
  const ats = analytics?.ats || {};
  const interviewPoints = Array.isArray(interview.points) ? interview.points : [];
  const atsPoints = Array.isArray(ats.points) ? ats.points : [];
  const rangeLabel = RANGE_OPTIONS.find((option) => option.value === range)?.label || "Last 30 days";
  const atsChange = ats.changeFromPrevious;

  if (error) {
    return (
      <div className="dash-card flex min-h-[22rem] flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Analytics are unavailable</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">{error}</p>
        <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">Try again</button>
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Performance analytics">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Performance analytics</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Verified saved activity for {rangeLabel.toLowerCase()}.</p>
        </div>
        <label className="sr-only" htmlFor="analytics-range">Analytics date range</label>
        <select id="analytics-range" value={range} onChange={(event) => onRangeChange?.(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="dash-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Interview Performance</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Completed interview reports only</p>
            </div>
            {!loading && interviewPoints.length > 0 && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{interview.totalCompleted} completed</span>}
          </div>
          <div className="mt-5">
            {loading ? <LoadingChart /> : interviewPoints.length > 0 ? <InterviewLineChart points={interviewPoints} /> : (
              <EmptyChart title="No completed interviews in this range" description="Finish an Interview Coach or AI Simulator session to see actual scores here." to="/mock-interview" actionLabel="Start interview practice" />
            )}
          </div>
          {!loading && interviewPoints.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Metric label="Average" value={formatScore(interview.averageScore, "/10")} />
              <Metric label="Best" value={formatScore(interview.bestScore, "/10")} />
              <Metric label="Included" value={interview.totalCompleted || 0} />
            </div>
          )}
        </article>

        <article className="dash-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">ATS Score Trend</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Each point is one saved ATS scan</p>
            </div>
            {!loading && atsPoints.length > 0 && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{ats.totalAnalyses} scans</span>}
          </div>
          <div className="mt-5">
            {loading ? <LoadingChart /> : atsPoints.length > 0 ? <AtsBarChart points={atsPoints} /> : (
              <EmptyChart title="No ATS scans in this range" description="Run a resume scan to record a verified ATS score and track it over time." to="/ats" actionLabel="Run ATS scan" />
            )}
          </div>
          {!loading && atsPoints.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Metric label="Average" value={formatScore(ats.averageScore, "%")} />
              <Metric label="Latest" value={formatScore(ats.latestScore, "%")} />
              <Metric label="Last change" value={atsChange === null || atsChange === undefined ? "Need 2 scans" : `${atsChange > 0 ? "+" : ""}${atsChange} pts`} />
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
