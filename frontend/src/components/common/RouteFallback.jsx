export default function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        Loading CareerPilot…
      </div>
    </div>
  );
}
