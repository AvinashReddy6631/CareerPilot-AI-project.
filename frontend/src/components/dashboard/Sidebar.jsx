import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  IconDashboard,
  IconResume,
  IconATS,
  IconInterview,
  IconMock,
  IconRoadmap,
  IconJobs,
  IconApplications,
  IconProfile,
} from "./NavIcons";
import ProComingSoonModal from "./ProComingSoonModal";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/resume-builder", label: "Resume Builder", icon: IconResume },
  { to: "/ats", label: "ATS Analyzer", icon: IconATS },
  { to: "/interview", label: "Interview Coach", icon: IconInterview },
  { to: "/mock-interview", label: "AI Simulator", icon: IconMock },
  { to: "/roadmap", label: "Career Roadmap", icon: IconRoadmap },
  { to: "/jobs", label: "Job Discovery", icon: IconJobs },
  { to: "/applications", label: "Application Tracker", icon: IconApplications },
  { to: "/profile", label: "Profile", icon: IconProfile },
];

export default function Sidebar({ onNavigate }) {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <>
      <aside className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200/80 px-5 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 shadow-sm shadow-brand-500/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
            <path
              d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            CareerPilot
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            AI Platform
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
        <div className="dash-card p-3">
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            Upgrade to Pro
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Unlimited mock interviews & advanced ATS insights.
          </p>
          <button
            type="button"
            onClick={() => setIsProModalOpen(true)}
            className="mt-2.5 w-full rounded-lg bg-gradient-to-r from-brand-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            View plans
          </button>
        </div>
      </div>
      </aside>
      <ProComingSoonModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </>
  );
}
