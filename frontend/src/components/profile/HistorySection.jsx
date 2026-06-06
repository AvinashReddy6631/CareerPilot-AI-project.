import { useState } from "react";
import { Link } from "react-router-dom";

const TABS = [
  { id: "resumes", label: "Resumes", path: "/resume-builder" },
  { id: "interviews", label: "Interviews", path: "/mock-interview" },
  { id: "atsScans", label: "ATS Scans", path: "/ats" },
  { id: "roadmaps", label: "Roadmaps", path: "/roadmap" },
];

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistorySection({ history, loading }) {
  const [activeTab, setActiveTab] = useState("resumes");

  const items = history?.[activeTab] || [];
  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="dash-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activity History</h3>
        <p className="mt-0.5 text-xs text-slate-500">Your recent career platform activity</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-slate-400">
                <path d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              No {currentTab?.label.toLowerCase()} yet
            </p>
            <Link
              to={currentTab?.path || "/dashboard"}
              className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Get started →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === "resumes" &&
              items.map((item) => (
                <HistoryRow
                  key={item._id}
                  title={item.jobTitle || item.name || "Resume"}
                  subtitle={`${item.template || "ATS Standard"} · ${formatDate(item.createdAt)}`}
                  badge={item.name}
                />
              ))}

            {activeTab === "interviews" &&
              items.map((item) => (
                <HistoryRow
                  key={item._id}
                  title={item.role}
                  subtitle={formatDate(item.interviewDate || item.createdAt)}
                  badge={item.grade || `${item.averageScore}/10`}
                  badgeColor="violet"
                />
              ))}

            {activeTab === "atsScans" &&
              items.map((item) => (
                <HistoryRow
                  key={item._id}
                  title={item.fileName || "Resume scan"}
                  subtitle={formatDate(item.createdAt)}
                  badge={`${item.atsScore}%`}
                  badgeColor={item.atsScore >= 70 ? "emerald" : "amber"}
                />
              ))}

            {activeTab === "roadmaps" &&
              items.map((item) => (
                <HistoryRow
                  key={item._id}
                  title={item.role}
                  subtitle={`${item.estimatedMonths} months · Job-ready month ${item.jobReadinessMonth} · ${formatDate(item.createdAt)}`}
                  badge={`${item.stagesCount} stages`}
                  badgeColor="cyan"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ title, subtitle, badge, badgeColor = "brand" }) {
  const badgeColors = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {badge && (
        <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${badgeColors[badgeColor]}`}>
          {badge}
        </span>
      )}
    </div>
  );
}
