import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconMenu,
  IconProfile,
} from "./NavIcons";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Mock interview score improved",
    body: "Your latest score is 8.2 — up 12% from last week.",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    title: "ATS scan complete",
    body: "Your resume scored 87% for Frontend Developer roles.",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    title: "New jobs match your profile",
    body: "14 openings found based on your skills.",
    time: "1d ago",
    unread: false,
  },
];

const SEARCH_ITEMS = [
  { label: "Resume Builder", path: "/resume-builder" },
  { label: "ATS Analyzer", path: "/ats" },
  { label: "Mock Interview", path: "/mock-interview" },
  { label: "Job Finder", path: "/jobs" },
  { label: "Application Tracker", path: "/applications" },
];

export default function TopNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredSearch = SEARCH_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="nav-icon-btn lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <div ref={searchRef} className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600"
          >
            <IconSearch className="h-4 w-4" />
            <span className="hidden md:inline">Search…</span>
            <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 md:inline dark:border-slate-700 dark:bg-slate-800">
              ⌘K
            </kbd>
          </button>

          {searchOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search features…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <ul className="max-h-48 overflow-y-auto p-1">
                {filteredSearch.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
                {filteredSearch.length === 0 && (
                  <li className="px-3 py-4 text-center text-sm text-slate-400">No results</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="nav-icon-btn sm:hidden"
          aria-label="Search"
        >
          <IconSearch className="h-[18px] w-[18px]" />
        </button>

        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="nav-icon-btn relative"
            aria-label="Notifications"
          >
            <IconBell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notifications
                </p>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className={`border-b border-slate-50 px-4 py-3 last:border-0 dark:border-slate-800 ${
                      n.unread ? "bg-brand-50/50 dark:bg-brand-500/5" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="nav-icon-btn"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <IconMoon className="h-[18px] w-[18px]" />
          ) : (
            <IconSun className="h-[18px] w-[18px]" />
          )}
        </button>

        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-950"
            aria-label="User menu"
          >
            CP
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">CareerPilot User</p>
                <p className="text-xs text-slate-500">Free plan</p>
              </div>
              <ul className="p-1">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      setUserOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <IconProfile className="h-4 w-4" />
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
