import { useEffect, useState } from "react";

export default function AICareerAssistant() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (!assistantOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setAssistantOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [assistantOpen]);

  return (
    <>
      {assistantOpen && (
        <section
          id="ai-career-assistant"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-career-assistant-title"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[60] rounded-2xl border border-brand-200 bg-white p-5 shadow-xl dark:border-brand-500/30 dark:bg-slate-900 sm:left-auto sm:right-6 sm:w-96"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Coming Soon
                </p>
              </div>
              <h2 id="ai-career-assistant-title" className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                AI Career Assistant
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close AI Career Assistant message"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M5.293 4.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Our AI career assistant is currently under development. Soon, you&apos;ll be able to get personalized job recommendations, career guidance, and intelligent job-search assistance directly inside CareerPilot AI.
          </p>
        </section>
      )}

      <button
        type="button"
        onClick={() => setAssistantOpen((open) => !open)}
        aria-label="AI Career Assistant"
        aria-expanded={assistantOpen}
        aria-controls="ai-career-assistant"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 sm:bottom-6 sm:right-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.5 10.5 0 01-4.494-1.004L3 20l1.319-3.957A7.72 7.72 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </>
  );
}
