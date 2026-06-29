export default function MatchProgressBar({ label, score, matched, total, accent = "brand" }) {
  const colors = {
    brand: "bg-brand-500",
    violet: "bg-violet-500",
    cyan: "bg-cyan-500",
    emerald: "bg-emerald-500",
  };

  const textColors = {
    brand: "text-brand-600 dark:text-brand-400",
    violet: "text-violet-600 dark:text-violet-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {total !== undefined && (
            <span className="text-xs text-slate-400">
              {matched}/{total}
            </span>
          )}
          <span className={`text-sm font-bold ${textColors[accent]}`}>{score}%</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colors[accent]}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}
