import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchResumeHistory, fetchResumeById } from "../../services/resumeService";
import { resumeFromApi } from "../../utils/resumeDefaults";

export default function ResumeHistoryPanel({ open, onClose, onLoad, onError }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchResumeHistory();
        setResumes(res.data.resumes || []);
      } catch (error) {
        console.error(error);
        const message = error.response?.data?.message || error.message || "Could not load resume history. Check your connection.";
        setError(message);
        setResumes([]);
        onError?.(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, onError]);

  const handleLoad = async (id) => {
    setLoadingId(id);
    try {
      const res = await fetchResumeById(id);
      onLoad(resumeFromApi(res.data.resume));
      onClose();
    } catch (error) {
      console.error(error);
      onError?.(error.response?.data?.message || error.message || "Failed to load resume");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close history"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Resume History</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Load a previously saved resume</p>
              </div>
              <button type="button" onClick={onClose} className="nav-icon-btn" aria-label="Close">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <p className="mt-3 text-sm text-slate-500">Loading history…</p>
                </div>
              )}

              {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-500/30 dark:bg-red-500/10">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {!loading && !error && resumes.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 4h12v16H6V4z" strokeLinejoin="round" />
                      <path d="M9 9h6M9 13h4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">No saved resumes yet</p>
                  <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                    Click Save in the toolbar to store your resume and access it here anytime.
                  </p>
                </div>
              )}

              <ul className="space-y-2">
                {resumes.map((r, i) => (
                  <motion.li
                    key={r._id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleLoad(r._id)}
                      disabled={loadingId === r._id}
                      className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all hover:border-brand-300 hover:shadow-md disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-brand-500/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {r.name || "Untitled"}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {r.jobTitle || r.email}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                          {r.template}
                        </span>
                      </div>
                      {r.summary && (
                        <p className="mt-2 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                          {r.summary}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
