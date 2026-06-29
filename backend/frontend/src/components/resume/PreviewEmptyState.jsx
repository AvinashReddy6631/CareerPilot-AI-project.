import { motion } from "framer-motion";

export default function PreviewEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-violet-100 dark:from-brand-500/20 dark:to-violet-500/20">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 4h12v16H6V4z" strokeLinejoin="round" />
          <path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
        Your resume preview will appear here
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Start filling in your personal information on the left. Changes update in real time.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["Name", "Experience", "Skills"].map((step) => (
          <span
            key={step}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {step}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
