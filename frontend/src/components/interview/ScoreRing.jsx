export default function ScoreRing({ score, label, size = 100, max = 10 }) {
  const pct = Math.min(100, (score / max) * 100);
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 80
      ? "stroke-emerald-500 text-emerald-600 dark:text-emerald-400"
      : pct >= 60
        ? "stroke-brand-500 text-brand-600 dark:text-brand-400"
        : pct >= 40
          ? "stroke-amber-500 text-amber-600 dark:text-amber-400"
          : "stroke-red-500 text-red-600 dark:text-red-400";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-slate-100 dark:stroke-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${color.split(" ")[0]} transition-all duration-700 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color.split(" ").slice(1).join(" ")}`}>
            {typeof score === "number" ? score.toFixed(1) : score}
          </span>
          {max === 10 ? (
            <span className="text-[10px] text-slate-400">/ {max}</span>
          ) : max === 100 ? (
            <span className="text-[10px] text-slate-400">%</span>
          ) : null}
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
    </div>
  );
}
