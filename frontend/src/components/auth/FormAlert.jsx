export default function FormAlert({ type = "error", message }) {
  if (!message) return null;

  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  const icons = {
    error: (
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
    ),
    success: (
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.7 4.3a1 1 0 00-1.4-1.4L7 7.6 5.7 6.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" />
    ),
  };

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}
      role="alert"
    >
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
        {icons[type]}
      </svg>
      <span>{message}</span>
    </div>
  );
}
