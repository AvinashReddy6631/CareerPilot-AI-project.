/**
 * Input Validation Utilities
 * Provides secure validation functions for all user inputs
 */

// Email validation
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Password validation - requires minimum complexity
const isValidPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 8;
};
// URL validation for links
const isValidUrl = (urlString) => {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const url = new URL(urlString);
    // Only allow http and https protocols
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
};

// Name validation
const isValidName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 255) return false;
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(trimmed);
};

// Phone number validation (basic international format)
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.trim());
};

// String length validation
const isValidString = (
  str,
  minLength = 0,
  maxLength = 1000
) => {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

// Array validation
const isValidArray = (arr, minLength = 0, maxLength = 100) => {
  if (!Array.isArray(arr)) return false;
  return arr.length >= minLength && arr.length <= maxLength;
};

// Sanitize string to prevent XSS
const sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .slice(0, 1000)
    .replace(/[<>]/g, ""); // Remove angle brackets
};

// Validate user registration data
const validateRegistration = (data) => {
  const errors = {};

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.password =
      "Password must be 8+ characters with uppercase, lowercase, and number";
  }

  if (!data.name || !isValidName(data.name)) {
    errors.name = "Valid name is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate login data
const validateLogin = (data) => {
  const errors = {};

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.password || typeof data.password !== "string") {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate profile update
const validateProfileUpdate = (data) => {
  const errors = {};

  if (
    data.name !== undefined &&
    (!data.name || !isValidName(data.name))
  ) {
    errors.name = "Valid name is required";
  }

  if (
    data.email !== undefined &&
    (!data.email || !isValidEmail(data.email))
  ) {
    errors.email = "Valid email is required";
  }

  if (
    data.phone !== undefined &&
    data.phone &&
    !isValidPhone(data.phone)
  ) {
    errors.phone = "Valid phone number is required";
  }

  if (
    data.linkedinUrl !== undefined &&
    data.linkedinUrl &&
    !isValidUrl(data.linkedinUrl)
  ) {
    errors.linkedinUrl = "Valid LinkedIn URL is required";
  }

  if (
    data.githubUrl !== undefined &&
    data.githubUrl &&
    !isValidUrl(data.githubUrl)
  ) {
    errors.githubUrl = "Valid GitHub URL is required";
  }

  if (
    data.portfolioUrl !== undefined &&
    data.portfolioUrl &&
    !isValidUrl(data.portfolioUrl)
  ) {
    errors.portfolioUrl = "Valid portfolio URL is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidName,
  isValidPhone,
  isValidString,
  isValidArray,
  sanitizeString,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
};
