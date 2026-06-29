import SourceBadge from "./SourceBadge";
import MatchScoreBadge from "./MatchScoreBadge";
import MatchProgressBar from "../ats/MatchProgressBar";

export default function JobDetailPanel({ job, onClose }) {
  if (!job) {
    return (
      <div className="dash-card flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-slate-400">
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
          Select a job to view details and match breakdown
        </p>
      </div>
    );
  }

  return (
    <div className="dash-card sticky top-20 overflow-hidden">
      <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{job.role}</h2>
              <SourceBadge source={job.source} />
            </div>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {job.company}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 lg:hidden"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span>📍 {job.location}</span>
          <span>💰 {job.salary}</span>
          <span>🕐 {job.experience}</span>
        </div>

        {job.matchScore != null && (
          <div className="rounded-xl bg-brand-50/50 p-4 dark:bg-brand-500/5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Resume Match
              </span>
              <MatchScoreBadge score={job.matchScore} size="lg" />
            </div>
            {job.skillMatch != null && (
              <MatchProgressBar
                label="Skills"
                score={job.skillMatch}
                accent="brand"
              />
            )}
            {job.keywordMatch != null && (
              <div className="mt-3">
                <MatchProgressBar
                  label="Keywords"
                  score={job.keywordMatch}
                  accent="violet"
                />
              </div>
            )}
            {job.matchedSkills?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Matched: {job.matchedSkills.join(", ")}
                </p>
              </div>
            )}
            {job.missingSkills?.length > 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Missing: {job.missingSkills.slice(0, 5).join(", ")}
              </p>
            )}
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {job.description}
          </p>
        </div>

        {job.skills?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Required Skills
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
        >
          Apply on Platform
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          </svg>
        </a>
        <p className="text-center text-[11px] text-slate-400">
          Opens in a new tab — you apply manually on the platform
        </p>
      </div>
    </div>
  );
}
