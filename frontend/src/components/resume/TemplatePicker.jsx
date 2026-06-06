import { motion } from "framer-motion";
import { TEMPLATES } from "../../utils/resumeDefaults";

export default function TemplatePicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((t, i) => {
        const active = selected === t.id;
        return (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-shadow ${
              active
                ? "border-brand-500 bg-brand-50/30 shadow-md shadow-brand-500/10 ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-500/5"
                : "border-slate-200/80 bg-white shadow-sm hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600"
            }`}
          >
            <div className={`mb-3 h-[72px] rounded-xl bg-gradient-to-br ${t.accent} p-3 shadow-inner`}>
              <div className="h-2 w-10 rounded-full bg-white/90" />
              <div className="mt-2 h-1.5 w-14 rounded-full bg-white/50" />
              <div className="mt-1.5 h-1.5 w-11 rounded-full bg-white/35" />
              <div className="mt-3 flex gap-1">
                <div className="h-1 flex-1 rounded bg-white/25" />
                <div className="h-1 flex-1 rounded bg-white/25" />
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{t.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                  {t.description}
                </p>
              </div>
              {t.badge && (
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {t.badge}
                </span>
              )}
            </div>
            {active && (
              <motion.span
                layoutId="template-check"
                className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm"
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
