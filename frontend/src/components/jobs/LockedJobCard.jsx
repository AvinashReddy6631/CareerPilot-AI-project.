export default function LockedJobCard({ onUpgrade }) {
  return (
    <article className="dash-card overflow-hidden">
      {/* Blurred job preview */}
      <div className="relative p-5">
        <div className="pointer-events-none select-none blur-[5px]">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700" />

            <div className="min-w-0 flex-1">
              <div className="h-4 w-2/3 rounded bg-slate-300 dark:bg-slate-600" />

              <div className="mt-2 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="h-7 w-14 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="mt-4 flex gap-4">
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="mt-3 flex gap-2">
            <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-14 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
          <div className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg shadow-sm dark:bg-slate-800">
              🔒
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              More jobs available
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Upgrade to unlock full job access
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade action */}
      <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onUpgrade}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          🚀 Upgrade to Pro
        </button>
      </div>
    </article>
  );
}