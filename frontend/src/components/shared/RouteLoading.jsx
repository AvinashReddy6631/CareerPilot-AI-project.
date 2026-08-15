export default function RouteLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        Loading CareerPilot…
      </div>
    </div>
  );
}
