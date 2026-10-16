const SOURCE_CONFIG = {
  greenhouse: {
    label: "Greenhouse",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  lever: {
    label: "Lever",
    className: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  },
};

export default function SourceBadge({ source }) {
  const config = SOURCE_CONFIG[source] || {
    label: source,
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export { SOURCE_CONFIG };
