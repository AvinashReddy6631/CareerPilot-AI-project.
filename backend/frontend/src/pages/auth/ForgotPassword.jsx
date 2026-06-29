import { useState } from "react";
import { Link } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import AuthLayout from "../../components/auth/AuthLayout";
import GlassCard from "../../components/auth/GlassCard";
import FormInput from "../../components/auth/FormInput";
import SubmitButton from "../../components/auth/SubmitButton";
import FormAlert from "../../components/auth/FormAlert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touched) setError(validateEmail(e.target.value));
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    setTouched(true);
    if (emailError) return;

    setLoading(true);

    // Simulated request — wire to backend when reset endpoint is available
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthLayout>
        <GlassCard>
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M4 4h16v16H4V4z"
                  strokeLinejoin="round"
                />
                <path d="M4 8l8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Check your inbox
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              If an account exists for{" "}
              <span className="font-medium text-slate-700">{email}</span>, we&apos;ve
              sent password reset instructions.
            </p>

            <div className="mt-5 text-left">
              <FormAlert
                type="success"
                message="Didn't receive it? Check your spam folder or try again in a few minutes."
              />
            </div>

            <Link
              to="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to sign in
            </Link>
          </div>
        </GlassCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <GlassCard>
        <div className="mb-7">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to sign in
          </Link>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Reset your password
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormInput
            id="email"
            label="Email address"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@company.com"
            error={touched ? error : ""}
            autoComplete="email"
            disabled={loading}
          />

          <SubmitButton loading={loading}>Send reset link</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/" className="font-semibold text-brand-600 hover:text-brand-500">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
}
