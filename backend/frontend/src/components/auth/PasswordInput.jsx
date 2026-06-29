import { useState } from "react";

export default function PasswordInput({
  id,
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder = "Enter your password",
  error,
  autoComplete,
  disabled = false,
  hint,
}) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={[
            "input-ring w-full rounded-xl border bg-white py-2.5 pl-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-red-300 focus:border-red-400"
              : "border-slate-200 focus:border-brand-500",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.5 10s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z" />
              <circle cx="10" cy="10" r="2.5" />
              <path d="M3 17L17 3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.5 10s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
          )}
        </button>
      </div>
      {hasError && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-red-600" role="alert">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
