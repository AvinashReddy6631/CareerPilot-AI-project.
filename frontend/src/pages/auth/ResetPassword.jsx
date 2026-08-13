import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { validateConfirmPassword, validatePassword } from "../../utils/validation";
import AuthLayout from "../../components/auth/AuthLayout";
import GlassCard from "../../components/auth/GlassCard";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import FormAlert from "../../components/auth/FormAlert";

function getPasswordStrength(password) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { label: "Weak", width: "w-1/4", color: "bg-red-500" };
  if (score === 3) return { label: "Fair", width: "w-2/4", color: "bg-amber-500" };
  if (score === 4) return { label: "Good", width: "w-3/4", color: "bg-brand-500" };
  return { label: "Strong", width: "w-full", color: "bg-emerald-500" };
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const strength = getPasswordStrength(formData.password);
  const tokenMissing = !token;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setServerError("");

    if (touched[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: name === "password"
          ? validatePassword(value, { minLength: 8 })
          : validateConfirmPassword(next.password, value),
        ...(name === "password" && touched.confirmPassword
          ? { confirmPassword: validateConfirmPassword(value, next.confirmPassword) }
          : {}),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    setErrors((previous) => ({
      ...previous,
      [name]: name === "password"
        ? validatePassword(value, { minLength: 8 })
        : validateConfirmPassword(formData.password, value),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      password: validatePassword(formData.password, { minLength: 8 }),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
    };
    setErrors(nextErrors);
    setTouched({ password: true, confirmPassword: true });
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || tokenMissing) return;

    setLoading(true);
    setServerError("");

    try {
      await resetPassword(token, formData.password);
      setSubmitted(true);
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Unable to reset your password. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout>
        <GlassCard>
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600">✓</div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Password reset successful</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Your password has been updated. You can now sign in with your new password.</p>
            <Link to="/" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-brand-500 hover:to-violet-500">Back to sign in</Link>
          </div>
        </GlassCard>
      </AuthLayout>
    );
  }

  if (tokenMissing) {
    return (
      <AuthLayout>
        <GlassCard>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Invalid reset link</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">This password reset link is invalid or has expired. Request a new link to continue.</p>
            <Link to="/forgot-password" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-brand-500 hover:to-violet-500">Request a new link</Link>
            <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-500">Back to sign in</Link>
          </div>
        </GlassCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <GlassCard>
        <div className="mb-7">
          <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Back to sign in</Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Choose a new password</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Use at least 8 characters and choose a password you have not used before.</p>
        </div>

        {serverError && <FormAlert type="error" message={serverError} />}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <PasswordInput
            id="password"
            label="New password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="At least 8 characters"
            error={touched.password ? errors.password : ""}
            autoComplete="new-password"
            disabled={loading}
          />

          {strength && (
            <div className="-mt-2" aria-live="polite">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={`h-full rounded-full transition-all ${strength.width} ${strength.color}`} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Password strength: {strength.label}</p>
            </div>
          )}

          <PasswordInput
            id="confirmPassword"
            label="Confirm new password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Re-enter your new password"
            error={touched.confirmPassword ? errors.confirmPassword : ""}
            autoComplete="new-password"
            disabled={loading}
          />

          <SubmitButton loading={loading}>Reset password</SubmitButton>
        </form>
      </GlassCard>
    </AuthLayout>
  );
}
