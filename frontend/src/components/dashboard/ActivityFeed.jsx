const DOT_BY_TYPE = {
  resume: "bg-cyan-500",
  ats: "bg-brand-500",
  interview: "bg-violet-500",
  mock: "bg-indigo-500",
  roadmap: "bg-amber-500",
  application: "bg-emerald-500",
  profile: "bg-slate-500",
};

function formatRelativeTime(dateValue) {
  if (!dateValue) return "";

  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (diffSeconds < 60) return "Just now";

  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  const [unit, seconds] = units.find(
    ([, unitSeconds]) => diffSeconds >= unitSeconds
  );

  return formatter.format(
    -Math.floor(diffSeconds / seconds),
    unit
  );
}

export default function ActivityFeed({
  activities = [],
  loading = false,
  error = "",
}) {
  return (
    <div className="dash-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activity Feed</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Recent actions across your workspace
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          View all
        </button>
      </div>

      {loading && (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex gap-3 py-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800/70" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white">No activity yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your resume, interview, roadmap, application, and profile updates will appear here.
          </p>
        </div>
      )}

      {!loading && !error && activities.length > 0 && (
        <ul className="mt-4 space-y-0">
          {activities.map((item, i) => (
            <li
              key={item.id}
              className={`relative flex gap-3 py-3 ${
                i < activities.length - 1
                  ? "border-b border-slate-100 dark:border-slate-800"
                  : ""
              }`}
            >
              <div className="relative flex flex-col items-center">
                <span className={`h-2 w-2 rounded-full ${DOT_BY_TYPE[item.type] || "bg-slate-500"} ring-4 ring-white dark:ring-slate-900`} />
                {i < activities.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                <p className="mt-1 text-[10px] text-slate-400">{formatRelativeTime(item.occurredAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
