import { AnimatePresence, motion } from "framer-motion";

const styles = {
  success: "bg-slate-900 text-white shadow-xl dark:bg-white dark:text-slate-900",
  error: "bg-red-600 text-white shadow-xl",
  info: "bg-brand-600 text-white shadow-xl",
};

export default function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={`fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium ${styles[toast.type] || styles.success}`}
          role="status"
        >
          {toast.type !== "error" ? (
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.7 4.3a1 1 0 00-1.4-1.4L7 7.6 5.7 6.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          )}
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
