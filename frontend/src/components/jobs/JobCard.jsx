
import { useState } from "react";
import SourceBadge from "./SourceBadge";
import MatchScoreBadge from "./MatchScoreBadge";

const formatPublishedDate = (publishedAt) => {
  if (!publishedAt) return "Date not provided";

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return "Date not provided";

  return `Posted ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)}`;
};

export default function JobCard({
  job,
  isSaved,
  onSave,
  onUnsave,
  onTrack,
  onApply,
  onSelect,
  selected,
  locked = false,
  onUpgrade,
}) {  const [actionLoading, setActionLoading] = useState("");

  const handleLockedClick = (event) => {
    event.stopPropagation();
    onUpgrade?.();
  };

  const handleSave = async () => {
    setActionLoading("save");

    try {
      if (isSaved) {
        await onUnsave?.(job);
      } else {
        await onSave?.(job);
      }
    } finally {
      setActionLoading("");
    }
  };

  const handleTrack = async () => {
    setActionLoading("track");

    try {
      await onTrack?.(job);
    } finally {
      setActionLoading("");
    }
  };
  const handleApply = async () => {
  setActionLoading("apply");

  try {
    await onApply?.(job);
  } finally {
    setActionLoading("");
  }
};

  const companyInitial =
    job.company?.charAt(0)?.toUpperCase() || "?";

  return (
    <article
      className={`dash-card group cursor-pointer overflow-hidden transition-all hover:shadow-md ${
        selected ? "ring-2 ring-brand-500/50" : ""
      }`}
      onClick={() => onSelect?.(job)}
    >
      {/* Job information */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Company logo */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-bold text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
            {companyInitial}
          </div>

          {/* Job title + company */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {job.role}
              </h3>

              <SourceBadge source={job.source} />

              {job.type === "internship" && (
                <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
                  Internship
                </span>
              )}
            </div>

            <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-400">
              {job.company}
            </p>
          </div>

          <MatchScoreBadge score={job.matchScore} />
        </div>

        {/* Job metadata */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {job.location || "Location not provided"}
          </span>

          <span className="flex items-center gap-1">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267c-.18-.12-.33-.257-.433-.418z" />

              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 102 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>

            {job.salary || "Salary not provided"}
          </span>

          <span>{job.experience || job.employmentType || "Experience not provided"}</span>

          <span>{formatPublishedDate(job.publishedAt)}</span>
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-800"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Apply / Upgrade */}
        {locked ? (
          <button
            type="button"
            onClick={handleLockedClick}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            🔒 Upgrade to Apply
          </button>
        ) : (
          <button
  type="button"
  onClick={handleApply}
  disabled={actionLoading === "apply"}
  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
>
  {actionLoading === "apply"
    ? "Checking..."
    : "Apply"}
</button>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={actionLoading === "save"}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            isSaved
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
              : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
          title={isSaved ? "Remove from saved" : "Save job"}
        >
          {isSaved ? "★ Saved" : "☆ Save"}
        </button>

        {/* Track */}
        <button
          type="button"
          onClick={handleTrack}
          disabled={actionLoading === "track"}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Add to application tracker"
        >
          Track
        </button>
      </div>
    </article>
  );
}
