import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  validateName,
  validatePhone,
  validateUrl,
  validateGraduationYear,
  validateTargetRole,
} from "../../utils/validation";
import { getInitials } from "../../utils/profileCompletion";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  college: "",
  degree: "",
  graduationYear: "",
  targetRole: "",
  skills: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  profilePicture: "",
};

export default function EditProfileDrawer({ open, onClose, user, onSave, saving, error }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        college: user.college || "",
        degree: user.degree || "",
        graduationYear: user.graduationYear || "",
        targetRole: user.targetRole || "",
        skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
        portfolioUrl: user.portfolioUrl || "",
        profilePicture: user.profilePicture || "",
      });
      setErrors({});
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setErrors((prev) => ({ ...prev, profilePicture: "Image must be under 500KB" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profilePicture: reader.result }));
      setErrors((prev) => ({ ...prev, profilePicture: "" }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next = {
      name: validateName(form.name),
      phone: validatePhone(form.phone),
      graduationYear: validateGraduationYear(form.graduationYear),
      targetRole: validateTargetRole(form.targetRole),
      linkedinUrl: validateUrl(form.linkedinUrl, { label: "LinkedIn URL" }),
      githubUrl: validateUrl(form.githubUrl, { label: "GitHub URL" }),
      portfolioUrl: validateUrl(form.portfolioUrl, { label: "Portfolio URL" }),
    };
    if (!form.college.trim()) next.college = "College is required";
    if (!form.degree.trim()) next.degree = "Degree is required";
    if (!form.skills.trim()) next.skills = "At least one skill is required";

    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      college: form.college.trim(),
      degree: form.degree.trim(),
      graduationYear: form.graduationYear.trim(),
      targetRole: form.targetRole.trim(),
      skills: form.skills,
      linkedinUrl: form.linkedinUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      portfolioUrl: form.portfolioUrl.trim(),
      profilePicture: form.profilePicture,
    });
  };

  const initials = getInitials(form.name);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                <p className="text-xs text-slate-500">Update your career information</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Avatar */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    {form.profilePicture ? (
                      <img
                        src={form.profilePicture}
                        alt="Profile"
                        className="h-20 w-20 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-brand-500/20">
                        {initials}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm dark:border-slate-900"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Profile photo</p>
                    <p className="text-xs text-slate-500">JPG or PNG, max 500KB</p>
                    {errors.profilePicture && (
                      <p className="mt-1 text-xs text-red-500">{errors.profilePicture}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
                  <Field label="Email" name="email" value={form.email} onChange={handleChange} disabled hint="Email cannot be changed" />
                  <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} required />
                  <Field label="College" name="college" value={form.college} onChange={handleChange} error={errors.college} required />
                  <Field label="Degree" name="degree" value={form.degree} onChange={handleChange} error={errors.degree} required placeholder="e.g. B.Tech Computer Science" />
                  <Field label="Graduation Year" name="graduationYear" value={form.graduationYear} onChange={handleChange} error={errors.graduationYear} required placeholder="e.g. 2026" />
                  <Field label="Target Role" name="targetRole" value={form.targetRole} onChange={handleChange} error={errors.targetRole} required placeholder="e.g. Frontend Developer" />
                  <Field label="Skills" name="skills" value={form.skills} onChange={handleChange} error={errors.skills} required placeholder="React, Node.js, Python (comma-separated)" />
                  <Field label="LinkedIn URL" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} error={errors.linkedinUrl} placeholder="linkedin.com/in/username" />
                  <Field label="GitHub URL" name="githubUrl" value={form.githubUrl} onChange={handleChange} error={errors.githubUrl} placeholder="github.com/username" />
                  <Field label="Portfolio URL" name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} error={errors.portfolioUrl} placeholder="yourportfolio.com" />
                </div>
              </div>

              <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, name, value, onChange, error, required, disabled, placeholder, hint }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`input-ring w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50"
            : error
              ? "border-red-300 bg-white text-slate-900 dark:border-red-500/50 dark:bg-slate-900 dark:text-white"
              : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        }`}
      />
      {hint && !error && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
