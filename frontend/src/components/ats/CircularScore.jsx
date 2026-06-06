export default function CircularScore({ score, grade, size = 160 }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 85
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 70
        ? "text-brand-600 dark:text-brand-400"
        : score >= 55
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  const ringColor =
    score >= 85
      ? "stroke-emerald-500"
      : score >= 70
        ? "stroke-brand-500"
        : score >= 55
          ? "stroke-amber-500"
          : "stroke-red-500";

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
            className={`${ringColor} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold tracking-tight ${scoreColor}`}>
            {score}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            ATS Score
          </span>
        </div>
      </div>
      {grade && (
        <span
          className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            score >= 85
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : score >= 70
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                : score >= 55
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {grade}
        </span>
      )}
    </div>
  );
}
