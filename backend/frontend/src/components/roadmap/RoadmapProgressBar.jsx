export default function RoadmapProgressBar({ value, max = 100, label, showPercent = true, size = "md" }) {
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const height = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  const barColor =
    percent >= 80
      ? "bg-emerald-500"
      : percent >= 50
        ? "bg-brand-500"
        : percent >= 25
          ? "bg-amber-500"
          : "bg-slate-300 dark:bg-slate-600";

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>}
          {showPercent && (
            <span className="font-semibold text-slate-700 dark:text-slate-300">{percent}%</span>
          )}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
