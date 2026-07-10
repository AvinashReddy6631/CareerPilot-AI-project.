import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PRO_FEATURES = [
  "Unlimited AI Interviews",
  "Advanced ATS Analyzer",
  "AI Resume Rewriter",
  "Unlimited Resume Versions",
  "Premium Resume Templates",
  "AI Career Mentor",
  "Priority AI Responses",
];

export default function ProComingSoonModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          role="presentation"
        >
          <motion.section
            aria-labelledby="pro-coming-soon-title"
            aria-modal="true"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            role="dialog"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-violet-600 px-6 pb-7 pt-6 text-white">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/80"
                aria-label="Close coming soon dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Coming soon</p>
              <h2 id="pro-coming-soon-title" className="relative mt-2 text-2xl font-bold tracking-tight">
                🚀 CareerPilot Pro Coming Soon
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                We are building premium AI-powered career tools for students.
              </p>

              <ul className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="CareerPilot Pro features">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M5 12.5l4.2 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Close
                </button>
                <button type="button" disabled className="cursor-not-allowed rounded-lg bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white opacity-60">
                  Notify Me — Coming Soon
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
