export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function InterviewTimer({ sessionSeconds, questionSeconds }) {
  return (
    <div className="flex gap-3">
      <div className="dash-card flex items-center gap-2 px-3 py-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-brand-500">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Session</p>
          <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
            {formatTime(sessionSeconds)}
          </p>
        </div>
      </div>
      <div className="dash-card flex items-center gap-2 px-3 py-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-amber-500">
          <path d="M12 8v4l2 2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Question</p>
          <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
            {formatTime(questionSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
}
