import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Sparkles } from "lucide-react";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { validateEmail, validatePassword } from "../../utils/validation";
import AuthLayout from "../../components/auth/AuthLayout";
import GlassCard from "../../components/auth/GlassCard";
import FormInput from "../../components/auth/FormInput";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import FormAlert from "../../components/auth/FormAlert";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError("");

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: name === "email" ? validateEmail(value) : validatePassword(value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: name === "email" ? validateEmail(value) : validatePassword(value),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
    setErrors(nextErrors);
    setTouched({ email: true, password: true });
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const data = await loginUser(formData);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card-enter">
      <GlassCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-300/20 blur-2xl" />
        <div className="relative mb-7">
          <div className="mb-5 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300"><Sparkles className="h-3 w-3" /> CareerPilot AI</span><LockKeyhole className="h-4 w-4 text-slate-400" aria-label="Secure sign in" /></div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.7rem]">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Sign in to continue your career journey
          </p>
        </div>

        {serverError && <FormAlert type="error" message={serverError} />}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <FormInput
            id="email"
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@company.com"
            error={touched.email ? errors.email : ""}
            autoComplete="email"
            disabled={loading}
          />

          <PasswordInput
            id="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ""}
            autoComplete="current-password"
            disabled={loading}
            hint={
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand-600 hover:text-brand-500"
              >
                Forgot password?
              </Link>
            }
          />

          <SubmitButton loading={loading}>Sign in</SubmitButton>
        </form>

        <p className="relative mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-brand-600 hover:text-brand-500"
          >
            Create account
          </Link>
        </p>
      </GlassCard>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> Your session is encrypted and protected.</p>
      </div>
    </AuthLayout>
  );
}
