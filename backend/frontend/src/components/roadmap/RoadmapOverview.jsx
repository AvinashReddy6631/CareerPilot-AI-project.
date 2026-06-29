import { motion } from "framer-motion";
import ScoreRing from "../interview/ScoreRing";
import RoadmapProgressBar from "./RoadmapProgressBar";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatJobReadyDate(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export default function RoadmapOverview({ role, meta, stats }) {
  const {
    estimatedMonths = 0,
    jobReadinessMonth = 0,
    totalTopics = 0,
    totalProjects = 0,
    certifications = [],
  } = meta || {};

  const jobReadyDate = formatJobReadyDate(jobReadinessMonth);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 grid gap-4 lg:grid-cols-12"
    >
      {/* Job readiness hero card */}
      <div className="dash-card relative overflow-hidden p-5 lg:col-span-5 lg:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/20 to-violet-500/10 blur-2xl" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <ScoreRing
            score={stats.jobReadinessScore}
            label="Job Readiness"
            size={120}
            max={100}
          />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Your Path to {role}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Job-ready by Month {jobReadinessMonth}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Estimated completion: <span className="font-medium text-slate-700 dark:text-slate-300">{jobReadyDate}</span>
            </p>
            <div className="mt-4">
              <RoadmapProgressBar
                value={stats.overallPercent}
                label="Overall progress"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-7">
        {[
          {
            label: "Timeline",
            value: `${estimatedMonths} mo`,
            sub: "Estimated duration",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" />
              </svg>
            ),
            color: "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10",
          },
          {
            label: "Topics",
            value: `${stats.completedTopics}/${totalTopics}`,
            sub: "Completed",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
              </svg>
            ),
            color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10",
          },
          {
            label: "Projects",
            value: `${stats.completedProjects}/${totalProjects}`,
            sub: "Built",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M3 7l9-4 9 4-9 4-9-4z" strokeLinejoin="round" />
                <path d="M3 12l9 4 9-4M3 17l9 4 9-4" strokeLinejoin="round" />
              </svg>
            ),
            color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10",
          },
          {
            label: "Milestones",
            value: `${stats.completedStages}/${stats.totalStages}`,
            sub: "Completed",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L6 21l2.3-7-6-4.6h7.6L12 2z" strokeLinejoin="round" />
              </svg>
            ),
            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
          },
        ].map((stat) => (
          <div key={stat.label} className="dash-card p-4">
            <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>{stat.icon}</div>
            <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="text-[10px] text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Certifications strip */}
      {certifications.length > 0 && (
        <div className="dash-card p-4 lg:col-span-12">
          <div className="mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-amber-500">
              <path d="M12 15l-3 5h6l-3-5z" strokeLinejoin="round" />
              <circle cx="12" cy="9" r="6" />
            </svg>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recommended Certifications
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <span
                key={cert.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-[9px] font-bold text-amber-800 dark:bg-amber-500/30 dark:text-amber-200">
                  M{cert.month}
                </span>
                {cert.name}
                <span className="text-amber-600/70 dark:text-amber-400/70">· {cert.provider}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
