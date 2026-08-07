import { Link } from "react-router-dom";
import AuthHero from "./AuthHero";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row overflow-x-hidden bg-slate-50 dark:bg-slate-950">

      {/* Left Hero - Desktop Only */}
      <div className="hidden lg:block lg:w-[54%] xl:w-[52%]">
        <AuthHero />
      </div>

      {/* Right Content */}
      <div className="auth-grid-bg relative flex w-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100/80 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/60" />

        <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-brand-300/15 blur-3xl dark:bg-brand-500/10" />

        <div className="relative flex flex-1 flex-col px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">

          {/* Mobile Logo */}
          <div className="mb-6 flex items-center justify-center lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-white"
                >
                  <path
                    d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="text-lg font-bold text-slate-900 dark:text-white">
                CareerPilot
              </span>
            </Link>
          </div>

          {/* Login/Register Card */}
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            {children}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CareerPilot AI. All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
}