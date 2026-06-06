import ScoreRing from "../interview/ScoreRing";

const METRICS = [
  {
    key: "atsAverageScore",
    label: "ATS Average",
    suffix: "%",
    max: 100,
    color: "brand",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "interviewAverageScore",
    label: "Interview Avg",
    suffix: "/10",
    max: 10,
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "roadmapProgress",
    label: "Roadmap Progress",
    suffix: "%",
    max: 100,
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M3 12h4l3-8 4 16 3-8h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "applicationsSent",
    label: "Applications Sent",
    suffix: "",
    max: null,
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M4 4h16v16H4V4z" strokeLinejoin="round" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const colorMap = {
  brand: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-500/10",
  violet: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10",
  cyan: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-500/10",
  emerald: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
};

export default function CareerReadiness({ stats, loading }) {
  return (
    <div className="dash-card p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Career Readiness</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Your performance across key career milestones
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {METRICS.map((metric) => {
          const value = stats?.[metric.key] ?? 0;
          const displayValue = loading
            ? "—"
            : metric.max === 10
              ? value.toFixed(1)
              : value;

          return (
            <div
              key={metric.key}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30"
            >
              <div className={`inline-flex rounded-lg p-2 ${colorMap[metric.color]}`}>
                {metric.icon}
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                {displayValue}
                {metric.suffix && !loading && (
                  <span className="text-sm font-medium text-slate-400">{metric.suffix}</span>
                )}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{metric.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
