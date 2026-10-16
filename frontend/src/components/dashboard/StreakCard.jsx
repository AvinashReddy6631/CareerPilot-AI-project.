const formatActivityDate = (dateKey) => {
  if (!dateKey) return "No activity recorded yet";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
};

export default function StreakCard({ streak, loading, error }) {
  const currentStreak = streak?.currentStreak || 0;
  const visibleDays = Math.min(currentStreak, 7);

  return (
    <section className="dash-card relative overflow-hidden p-5 sm:p-6" aria-labelledby="streak-title">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-400/10 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path d="M12 2.5c1 4.1-1.8 5.6-.5 8.2.7 1.4 2 1.9 2.7 1.9 1.5 0 2.8-1.3 2.8-3.3 2.8 2 4.3 4.8 4.3 7.3 0 3.2-2.5 5.6-5.8 5.6h-7C5.2 22.2 2.7 19.8 2.7 16.6c0-3.4 2.1-6.2 5.2-8.3-.1 2.2.8 3.7 2.2 3.7 1.6 0 2.5-1.4 1.9-3.4-.5-1.8-.3-3.7 0-6.1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 id="streak-title" className="text-sm font-semibold">Daily learning streak</h2>
          </div>

          {loading ? (
            <div className="mt-3 h-10 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentStreak} <span className="text-base font-medium text-slate-500 dark:text-slate-400">days</span>
            </p>
          )}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {currentStreak > 0
              ? "Keep showing up—your consistency is building momentum."
              : "Start your learning streak today."}
          </p>
        </div>

        <div className="min-w-[12rem] rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Longest streak</span>
            <span className="font-semibold text-slate-900 dark:text-white">{streak?.longestStreak || 0} days</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5" aria-label={`${currentStreak} consecutive learning days`}>
            {Array.from({ length: 7 }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 flex-1 rounded-full ${
                  index < visibleDays
                    ? "bg-gradient-to-r from-orange-400 to-amber-400"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Last activity (UTC): {formatActivityDate(streak?.lastActivityDate)}
          </p>
        </div>
      </div>

      {error && (
        <p className="relative mt-3 text-xs text-amber-700 dark:text-amber-300" role="status">
          Your streak could not be refreshed just now. It will update on your next authenticated session.
        </p>
      )}
    </section>
  );
}
