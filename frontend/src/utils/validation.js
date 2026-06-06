export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return "";
}

export function validatePassword(password, { minLength = 8 } = {}) {
  if (!password) return "Password is required";
  if (password.length < minLength)
    return `Password must be at least ${minLength} characters`;
  return "";
}

export function validateName(name) {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return "";
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
}

export function validatePhone(phone) {
  if (!phone?.trim()) return "Phone number is required";
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (!/^\+?\d{10,15}$/.test(cleaned)) return "Enter a valid phone number";
  return "";
}

export function validateUrl(url, { required = false, label = "URL" } = {}) {
  if (!url?.trim()) return required ? `${label} is required` : "";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (!parsed.hostname) return `Enter a valid ${label.toLowerCase()}`;
    return "";
  } catch {
    return `Enter a valid ${label.toLowerCase()}`;
  }
}

export function validateGraduationYear(year) {
  if (!year?.toString().trim()) return "Graduation year is required";
  const num = parseInt(year, 10);
  const current = new Date().getFullYear();
  if (Number.isNaN(num) || num < 1990 || num > current + 6) {
    return `Enter a year between 1990 and ${current + 6}`;
  }
  return "";
}

export function validateTargetRole(role) {
  if (!role?.trim()) return "Target role is required";
  if (role.trim().length < 2) return "Target role must be at least 2 characters";
  return "";
}
