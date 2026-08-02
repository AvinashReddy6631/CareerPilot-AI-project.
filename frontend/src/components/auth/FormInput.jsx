export default function FormInput({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  autoComplete,
  disabled = false,
}) {
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
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
          "input-ring theme-input w-full rounded-xl border px-4 py-2.5 text-sm",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800/60 dark:disabled:text-slate-500",
          hasError
            ? "border-red-300 focus:border-red-400"
            : "border-slate-200 focus:border-brand-500",
        ].join(" ")}
      />
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
