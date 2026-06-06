import { motion } from "framer-motion";

export default function AiActionButton({ onClick, loading, label = "AI Generate", compact = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-sm shadow-violet-500/20 transition-opacity disabled:opacity-60 ${
        compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      {loading ? (
        <>
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Generating…
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
            <path d="M8 1a1 1 0 011 1v1.07A5 5 0 0113 8a5 5 0 01-4 4.93V14a1 1 0 11-2 0v-.07A5 5 0 013 8a5 5 0 014-4.93V2a1 1 0 011-1z" />
          </svg>
          {label}
        </>
      )}
    </motion.button>
  );
}
