import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <GlassCard>
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
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

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-brand-600 hover:text-brand-500"
          >
            Create account
          </Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
}
