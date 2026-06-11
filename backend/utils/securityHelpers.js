/**
 * Security Helper Functions
 * Utilities for secure operations across the application
 */

/**
 * Remove sensitive fields from user objects
 */
const sanitizeUserResponse = (user) => {
  if (!user) return null;
  const sanitized = user.toObject?.() || user;
  delete sanitized.password;
  delete sanitized.__v;
  return sanitized;
};

/**
 * Check if user owns a resource
 */
const ownsResource = (
  userId,
  resourceUserId
) => {
  return (
    userId.toString() ===
    resourceUserId.toString()
  );
};

/**
 * Safe error message - don't leak implementation details
 */
const getSafeErrorMessage = (error) => {
  // Categorize errors and return safe messages
  if (error.name === "ValidationError") {
    return "Invalid input provided";
  }
  if (
    error.name === "MongoServerError"
  ) {
    return "Database operation failed";
  }
  if (
    error.name === "JsonWebTokenError"
  ) {
    return "Invalid authentication token";
  }
  // Default safe message
  return "An error occurred";
};

/**
 * Rate limit key generator for IP-based limiting
 */
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(
      ","
    )[0] ||
    req.connection.remoteAddress ||
    req.ip
  );
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(
    String(id)
  );
};

/**
 * Generate secure random token
 */
const generateSecureToken = (length = 32) => {
  const crypto = require("crypto");
  return crypto
    .randomBytes(length)
    .toString("hex");
};

/**
 * Check password strength
 */
const isStrongPassword = (password) => {
  if (!password || password.length < 8) {
    return false;
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(
    password
  );

  return (
    hasUpperCase &&
    hasLowerCase &&
    hasNumber
  );
};

/**
 * Create response with security headers
 */
const createSecureResponse = (
  data,
  statusCode = 200
) => {
  return {
    statusCode,
    data,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  sanitizeUserResponse,
  ownsResource,
  getSafeErrorMessage,
  getClientIp,
  isValidObjectId,
  generateSecureToken,
  isStrongPassword,
  createSecureResponse,
};
