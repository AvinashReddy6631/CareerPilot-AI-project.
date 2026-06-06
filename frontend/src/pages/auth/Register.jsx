import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from "../../utils/validation";
import AuthLayout from "../../components/auth/AuthLayout";
import GlassCard from "../../components/auth/GlassCard";
import FormInput from "../../components/auth/FormInput";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import FormAlert from "../../components/auth/FormAlert";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validators = {
    name: validateName,
    email: validateEmail,
    password: (v) => validatePassword(v, { minLength: 8 }),
    confirmPassword: (v) => validateConfirmPassword(formData.password, v),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setServerError("");

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validators[name](value),
        ...(name === "password" && touched.confirmPassword
          ? { confirmPassword: validateConfirmPassword(value, next.confirmPassword) }
          : {}),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validators[name](value),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password, { minLength: 8 }),
      confirmPassword: validateConfirmPassword(
        formData.password,
        formData.confirmPassword
      ),
    };
    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const data = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Registration failed. Please try again."
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
            Create your account
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Start building your career with AI-powered tools
          </p>
        </div>

        {serverError && <FormAlert type="error" message={serverError} />}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <FormInput
            id="name"
            label="Full name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Alex Johnson"
            error={touched.name ? errors.name : ""}
            autoComplete="name"
            disabled={loading}
          />

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
            placeholder="At least 8 characters"
            error={touched.password ? errors.password : ""}
            autoComplete="new-password"
            disabled={loading}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Re-enter your password"
            error={touched.confirmPassword ? errors.confirmPassword : ""}
            autoComplete="new-password"
            disabled={loading}
          />

          <SubmitButton loading={loading}>Create account</SubmitButton>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
          By creating an account, you agree to our{" "}
          <span className="text-slate-500">Terms of Service</span> and{" "}
          <span className="text-slate-500">Privacy Policy</span>.
        </p>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-brand-600 hover:text-brand-500">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
}
