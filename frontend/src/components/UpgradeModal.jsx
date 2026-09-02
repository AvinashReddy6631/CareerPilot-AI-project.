import { useState } from "react";
import { openRazorpayCheckout } from "../services/paymentService";

export default function UpgradeModal({
  isOpen,
  onClose,
  currentPlan = "FREE",
  title,
  message,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      await openRazorpayCheckout("PRO");
    } catch (error) {
      console.error("Upgrade failed:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start upgrade"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pb-5 pt-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl dark:bg-brand-500/10">
            🚀
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {title || "Unlock More Jobs"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {message ||
              "Upgrade your plan to access more jobs and apply without limits."}
          </p>
        </div>

        {/* Current plan */}
        <div className="mx-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Current plan
            </span>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {currentPlan}
            </span>
          </div>
        </div>

        {/* Pro plan */}
        <div className="mx-6 mt-4 rounded-xl border-2 border-brand-500/30 bg-brand-50/50 p-5 dark:border-brand-500/30 dark:bg-brand-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Pro
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Everything you need to land a job faster.
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                ₹199
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                / month
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500">✓</span>
              Full job access
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500">✓</span>
              Unlimited applications
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500">✓</span>
              Full ATS analysis
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500">✓</span>
              Full AI interview access
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500">✓</span>
              More resume templates
            </div>
          </div>
        </div>

        {/* Upgrade button */}
        <div className="px-6 pb-6 pt-5">
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Opening Checkout..."
              : "Upgrade to Pro — ₹199/month"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-xl px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Maybe later
          </button>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}