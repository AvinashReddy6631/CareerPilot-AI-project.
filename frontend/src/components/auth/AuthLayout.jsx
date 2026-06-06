import { Link } from "react-router-dom";
import AuthHero from "./AuthHero";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="lg:w-[52%] xl:w-1/2">
        <div className="h-32 sm:h-40 lg:h-full">
          <AuthHero />
        </div>
      </div>

      <div className="auth-grid-bg relative flex flex-1 flex-col bg-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100/80" />

        <div className="relative flex flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
                  <path
                    d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-base font-semibold text-slate-900">CareerPilot</span>
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center">
            {children}
          </div>

          <p className="relative mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CareerPilot AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
