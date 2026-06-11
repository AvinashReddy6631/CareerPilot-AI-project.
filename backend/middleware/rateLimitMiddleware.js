/**
 * Rate Limiting Middleware
 * Provides protection against brute force and DDoS attacks
 */

// Simple in-memory rate limiting (for single-server deployments)
// For production multi-server, use Redis-based rate limiting
const rateLimitStore = new Map();

// Cleanup old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 900000) {
      rateLimitStore.delete(key);
    }
  }
}, 900000);

/**
 * Generic rate limiter
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Max requests per window
 * @param {string} keyGenerator - Function to generate rate limit key
 */
const createRateLimiter = (
  windowMs,
  maxRequests,
  keyGenerator
) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, {
        count: 0,
        resetTime: now + windowMs,
      });
    }

    const record = rateLimitStore.get(key);

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count++;

    // Set rate limit headers
    res.setHeader(
      "RateLimit-Limit",
      maxRequests
    );
    res.setHeader(
      "RateLimit-Remaining",
      Math.max(0, maxRequests - record.count)
    );
    res.setHeader(
      "RateLimit-Reset",
      record.resetTime
    );

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message:
          "Too many requests, please try again later",
      });
    }

    next();
  };
};

// Login attempt rate limiter - 5 attempts per 15 minutes
const loginLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  (req) =>
    `login:${req.body.email || req.ip}`
);

// Registration rate limiter - 3 attempts per hour per IP
const registrationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  (req) => `register:${req.ip}`
);

// General API rate limiter - 100 requests per minute per IP
const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100,
  (req) =>
    `api:${req.user?._id || req.ip}`
);

// File upload rate limiter - 5 uploads per 10 minutes per user
const uploadLimiter = createRateLimiter(
  10 * 60 * 1000, // 10 minutes
  5,
  (req) =>
    `upload:${req.user?._id || req.ip}`
);

// Password reset rate limiter - 3 attempts per hour
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  (req) =>
    `reset:${req.body.email || req.ip}`
);

module.exports = {
  loginLimiter,
  registrationLimiter,
  apiLimiter,
  uploadLimiter,
  passwordResetLimiter,
  createRateLimiter,
};
