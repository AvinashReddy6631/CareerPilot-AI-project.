const STEPS = [
  { id: "role", label: "Role" },
  { id: "instructions", label: "Instructions" },
  { id: "mic", label: "Microphone" },
  { id: "camera", label: "Camera" },
  { id: "session", label: "Interview" },
  { id: "report", label: "Report" },
];

export default function StepIndicator({ currentStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-9 sm:w-9 ${
                    isComplete
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                      : isActive
                        ? "bg-brand-600 text-white shadow-md shadow-brand-500/40 ring-4 ring-brand-500/20"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  }`}
                >
                  {isComplete ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`hidden text-[10px] font-medium sm:block ${
                    isActive
                      ? "text-brand-600 dark:text-brand-400"
                      : isComplete
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2 ${
                    index < currentIndex
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
