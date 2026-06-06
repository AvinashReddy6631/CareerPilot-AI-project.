export default function AnalyticsMetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = "slate",
}) {
  const accents = {
    slate: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <div className="dash-card p-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accents[accent]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {sublabel && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
