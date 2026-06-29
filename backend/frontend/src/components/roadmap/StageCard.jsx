import { motion } from "framer-motion";
import RoadmapProgressBar from "./RoadmapProgressBar";

const RESOURCE_ICONS = {
  course: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M4 6h16v12H4V6z" strokeLinejoin="round" />
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M6 4h9l3 3v13H6V4z" strokeLinejoin="round" />
      <path d="M15 4v3h3" strokeLinejoin="round" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="M17 10l4-2v8l-4-2" strokeLinejoin="round" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M4 6h7a3 3 0 013 3v11H7a3 3 0 00-3 3V6z" />
      <path d="M20 6h-7a3 3 0 00-3 3v11h7a3 3 0 003-3V6z" />
    </svg>
  ),
  practice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 17l-6.5 3.5 2-7L2 9h7l3-7z" strokeLinejoin="round" />
    </svg>
  ),
};

const DIFFICULTY_COLORS = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

function CheckItem({ checked, onToggle, label, sublabel }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        checked
          ? "bg-emerald-50/80 dark:bg-emerald-500/10"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
          checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 group-hover:border-brand-400 dark:border-slate-600"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${checked ? "text-emerald-800 line-through dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}>
          {label}
        </span>
        {sublabel && (
          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{sublabel}</span>
        )}
      </span>
    </button>
  );
}

export default function StageCard({
  stage,
  stageIndex,
  isLast,
  isStageComplete,
  stageProgress,
  progress,
  onToggleTopic,
  onToggleProject,
  onToggleStage,
}) {
  const { month, title, goal, topics, projects, resources, certification } = stage;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: stageIndex * 0.08 }}
      className="relative flex gap-4 sm:gap-6"
    >
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => onToggleStage(stageIndex)}
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all sm:h-12 sm:w-12 ${
            isStageComplete
              ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : stageProgress > 0
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          }`}
          title={isStageComplete ? "Mark incomplete" : "Mark milestone complete"}
        >
          {isStageComplete ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            month
          )}
        </button>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800" />
        )}
      </div>

      {/* Card content */}
      <div className={`mb-6 min-w-0 flex-1 ${isLast ? "" : "pb-2"}`}>
        <div className="dash-card overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    Month {month}
                  </span>
                  {isStageComplete && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                        <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Complete
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                  {title}
                </h3>
              </div>
              <div className="w-full sm:w-36">
                <RoadmapProgressBar value={stageProgress} size="sm" showPercent />
              </div>
            </div>

            {/* Goal */}
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Goal</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{goal}</p>
              </div>
            </div>
          </div>

          {/* Body grid */}
          <div className="grid gap-0 divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
            {/* Topics */}
            <div className="p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Topics to Learn</h4>
              </div>
              <div className="space-y-0.5">
                {topics.map((topic, ti) => (
                  <CheckItem
                    key={ti}
                    checked={!!progress.topics[`${stageIndex}-${ti}`]}
                    onToggle={() => onToggleTopic(stageIndex, ti)}
                    label={topic}
                  />
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <path d="M3 7l9-4 9 4-9 4-9-4z" strokeLinejoin="round" />
                    <path d="M3 12l9 4 9-4" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Build These Projects</h4>
              </div>
              <div className="space-y-2">
                {projects.map((project, pi) => (
                  <div key={pi} className="rounded-lg border border-slate-100 dark:border-slate-800">
                    <CheckItem
                      checked={!!progress.projects[`${stageIndex}-${pi}`]}
                      onToggle={() => onToggleProject(stageIndex, pi)}
                      label={project.name}
                      sublabel={project.description}
                    />
                    {project.difficulty && (
                      <div className="border-t border-slate-100 px-3 py-1.5 dark:border-slate-800">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[project.difficulty] || DIFFICULTY_COLORS.Beginner}`}>
                          {project.difficulty}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="p-4 sm:col-span-2 sm:p-5 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <path d="M4 6h16v12H4V6z" strokeLinejoin="round" />
                    <path d="M8 10h8M8 14h5" strokeLinecap="round" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Learning Resources</h4>
              </div>
              <div className="space-y-2">
                {resources.map((resource, ri) => (
                  <a
                    key={ri}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50/50 dark:border-slate-800 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {RESOURCE_ICONS[resource.type] || RESOURCE_ICONS.docs}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                        {resource.name}
                      </span>
                      <span className="text-[10px] capitalize text-slate-400">
                        {resource.type} · {resource.provider}
                      </span>
                    </span>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0 text-slate-300">
                      <path d="M7 4h9v9M16 4L4 16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ))}
              </div>

              {certification && (
                <div className="mt-4 rounded-lg border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-3 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/5">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-amber-600 dark:text-amber-400">
                      <path d="M12 15l-3 5h6l-3-5z" strokeLinejoin="round" />
                      <circle cx="12" cy="9" r="6" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Certification
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {certification.name}
                  </p>
                  <p className="text-xs text-slate-500">{certification.provider}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
