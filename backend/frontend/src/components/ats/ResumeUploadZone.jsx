import { useRef, useState } from "react";

export default function ResumeUploadZone({ file, onFileChange, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;

    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type === "application/pdf") {
      onFileChange(dropped);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`group relative cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all ${
        dragOver
          ? "border-brand-400 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-500/5"
          : file
            ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-500/40 dark:bg-emerald-500/5"
            : "border-slate-200 hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-brand-500/50 dark:hover:bg-slate-800/50"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-brand-100 dark:bg-slate-800 dark:group-hover:bg-brand-500/15">
        {file ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 20h16" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {file ? (
        <>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {(file.size / 1024).toFixed(0)} KB · Click to replace
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            Drop resume PDF here
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            or click to browse · PDF only · Max 10 MB
          </p>
        </>
      )}
    </div>
  );
}
