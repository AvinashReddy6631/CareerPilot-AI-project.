import { motion } from "framer-motion";
import { TEMPLATES } from "../../utils/resumeDefaults";

export default function TemplateSwitcher({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TEMPLATES.map((t) => {
        const active = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className="relative"
          >
            {active && (
              <motion.span
                layoutId="template-pill"
                className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 block rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                active
                  ? "text-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {t.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
