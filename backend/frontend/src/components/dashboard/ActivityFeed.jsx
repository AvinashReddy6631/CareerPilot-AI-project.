const ACTIVITIES = [
  {
    id: 1,
    type: "interview",
    title: "Completed mock interview",
    detail: "Frontend Developer — scored 8.4/10",
    time: "2 hours ago",
    dot: "bg-violet-500",
  },
  {
    id: 2,
    type: "ats",
    title: "ATS analysis finished",
    detail: "Resume matched 87% for React Developer role",
    time: "5 hours ago",
    dot: "bg-brand-500",
  },
  {
    id: 3,
    type: "resume",
    title: "Resume updated",
    detail: "Professional template — 3 new skills added",
    time: "Yesterday",
    dot: "bg-cyan-500",
  },
  {
    id: 4,
    type: "application",
    title: "Application submitted",
    detail: "Software Engineer at TechCorp India",
    time: "2 days ago",
    dot: "bg-emerald-500",
  },
  {
    id: 5,
    type: "roadmap",
    title: "Career roadmap generated",
    detail: "AI Engineer — 6-month learning path",
    time: "3 days ago",
    dot: "bg-amber-500",
  },
];

export default function ActivityFeed() {
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

      <ul className="mt-4 space-y-0">
        {ACTIVITIES.map((item, i) => (
          <li
            key={item.id}
            className={`relative flex gap-3 py-3 ${
              i < ACTIVITIES.length - 1
                ? "border-b border-slate-100 dark:border-slate-800"
                : ""
            }`}
          >
            <div className="relative flex flex-col items-center">
              <span className={`h-2 w-2 rounded-full ${item.dot} ring-4 ring-white dark:ring-slate-900`} />
              {i < ACTIVITIES.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              <p className="mt-1 text-[10px] text-slate-400">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
