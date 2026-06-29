const SOURCE_CONFIG = {
  linkedin: {
    label: "LinkedIn",
    className: "bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/20 dark:text-[#70B5F9]",
  },
  internshala: {
    label: "Internshala",
    className: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  },
  unstop: {
    label: "Unstop",
    className: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  },
  indeed: {
    label: "Indeed",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  naukri: {
    label: "Naukri",
    className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
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
