import { Link } from "react-router-dom";
import { IconResume, IconATS, IconMock, IconJobs } from "./NavIcons";

const ACTIONS = [
  {
    to: "/resume-builder",
    label: "Build Resume",
    description: "Create ATS-optimized resume",
    icon: IconResume,
    color: "brand",
  },
  {
    to: "/ats",
    label: "Run ATS Scan",
    description: "Match resume to job description",
    icon: IconATS,
    color: "violet",
  },
  {
    to: "/mock-interview",
    label: "AI Interview Simulator",
    description: "Live scoring, transcript & report",
    icon: IconMock,
    color: "cyan",
  },
  {
    to: "/jobs",
    label: "Job Discovery",
    description: "Jobs & internships across 5 platforms",
    icon: IconJobs,
    color: "emerald",
  },
];

const colorMap = {
  brand: "group-hover:border-brand-300 group-hover:bg-brand-50/50 dark:group-hover:border-brand-500/30 dark:group-hover:bg-brand-500/5",
  violet: "group-hover:border-violet-300 group-hover:bg-violet-50/50 dark:group-hover:border-violet-500/30 dark:group-hover:bg-violet-500/5",
  cyan: "group-hover:border-cyan-300 group-hover:bg-cyan-50/50 dark:group-hover:border-cyan-500/30 dark:group-hover:bg-cyan-500/5",
  emerald: "group-hover:border-emerald-300 group-hover:bg-emerald-50/50 dark:group-hover:border-emerald-500/30 dark:group-hover:bg-emerald-500/5",
};

export default function QuickActions() {
  return (
    <div className="dash-card p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Jump into your most-used tools
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ACTIONS.map(({ to, label, description, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`group flex items-center gap-3 rounded-xl border border-slate-200/80 p-3 transition-all dark:border-slate-700/80 ${colorMap[color]}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-900">
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
