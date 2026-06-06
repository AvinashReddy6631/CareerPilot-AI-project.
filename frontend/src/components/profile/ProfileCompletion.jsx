import RoadmapProgressBar from "../roadmap/RoadmapProgressBar";

export default function ProfileCompletion({ percent, missingFields, onEdit }) {
  const isComplete = percent >= 100;

  return (
    <div className="dash-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Profile Completion
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {isComplete
              ? "Your profile is complete — great job!"
              : "Complete your profile for better job matches"}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white shadow-sm">
          {percent}%
        </div>
      </div>

      <div className="mt-4">
        <RoadmapProgressBar value={percent} showPercent={false} size="lg" />
      </div>

      {!isComplete && missingFields?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Missing fields
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingFields.map((field) => (
              <span
                key={field}
                className="rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
              >
                {field}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="mt-4 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
          >
            Complete profile →
          </button>
        </div>
      )}
    </div>
  );
}
