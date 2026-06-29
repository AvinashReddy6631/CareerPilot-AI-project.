const VARIANTS = {
  strengths: {
    title: "Strengths",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    headerClass: "text-emerald-700 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50/50 dark:bg-emerald-500/5",
  },
  weaknesses: {
    title: "Weaknesses",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
    ),
    headerClass: "text-amber-700 dark:text-amber-400",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-50/50 dark:bg-amber-500/5",
  },
  keywords: {
    title: "Missing Keywords",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <path d="M7 7h10v10H7z" strokeLinejoin="round" />
        <path d="M7 11h6M7 15h4" strokeLinecap="round" />
      </svg>
    ),
    headerClass: "text-red-700 dark:text-red-400",
    dotClass: "bg-red-400",
    bgClass: "bg-red-50/50 dark:bg-red-500/5",
  },
  recommendations: {
    title: "Recommendations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" strokeLinejoin="round" />
      </svg>
    ),
    headerClass: "text-brand-700 dark:text-brand-400",
    dotClass: "bg-brand-500",
    bgClass: "bg-brand-50/50 dark:bg-brand-500/5",
  },
};

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function InsightPanel({ variant, items }) {
  const config = VARIANTS[variant];
  if (!items?.length) return null;

  return (
    <div className={`dash-card overflow-hidden ${config.bgClass}`}>
      <div className="flex items-center gap-2 border-b border-slate-200/60 px-5 py-3.5 dark:border-slate-800">
        <span className={config.headerClass}>{config.icon}</span>
        <h3 className={`text-sm font-semibold ${config.headerClass}`}>{config.title}</h3>
        <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
          {items.length}
        </span>
      </div>

      {variant === "keywords" ? (
        <div className="flex flex-wrap gap-2 px-5 py-4">
          {items.map((item, i) => {
            const text = typeof item === "string" ? item : item.text;
            return (
              <span
                key={i}
                className="rounded-md border border-red-200 bg-white px-2.5 py-1 font-mono text-xs text-red-600 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-400"
              >
                {text}
              </span>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-slate-200/60 dark:divide-slate-800">
          {items.map((item, i) => {
            const text = typeof item === "string" ? item : item.text;
            const priority = typeof item === "object" ? item.priority : null;

            return (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                {variant === "recommendations" && priority ? (
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[priority]}`}
                  >
                    {priority}
                  </span>
                ) : (
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.dotClass}`} />
                )}
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
