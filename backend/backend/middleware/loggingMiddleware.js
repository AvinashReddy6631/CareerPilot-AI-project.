/**
 * Structured Logging Middleware
 * Provides secure logging without exposing sensitive data
 */

const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log security events
 */
const logSecurityEvent = (
  eventType,
  details
) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    details: {
      ...details,
      // Never log passwords or tokens
      password: undefined,
      token: undefined,
    },
  };

  // Append to security log
  const logFile = path.join(
    logsDir,
    "security.log"
  );
  fs.appendFileSync(
    logFile,
    JSON.stringify(logEntry) + "\n"
  );
};

/**
 * Log failed authentication attempts
 */
const logFailedAuth = (email, ip) => {
  logSecurityEvent("FAILED_AUTH", {
    email,
    ip,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log successful authentication
 */
const logSuccessfulAuth = (userId, ip) => {
  logSecurityEvent("SUCCESSFUL_AUTH", {
    userId,
    ip,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log authorization failures
 */
const logAuthorizationFailure = (
  userId,
  resource,
  ip
) => {
  logSecurityEvent("AUTH_FAILURE", {
    userId,
    resource,
    ip,
  });
};

/**
 * Log sensitive operations
 */
const logSensitiveOperation = (
  operation,
  userId,
  details
) => {
  logSecurityEvent("SENSITIVE_OP", {
    operation,
    userId,
    ...details,
  });
};

/**
 * Middleware for request logging
 */
const requestLoggingMiddleware = (
  req,
  res,
  next
) => {
  // Skip logging for health checks
  if (req.path === "/") {
    return next();
  }

  const start = Date.now();

  // Log response when finished
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;

    // Log API requests (don't log sensitive operations)
    if (
      !req.path.includes("/auth/") ||
      req.method !== "POST"
    ) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?._id || "anonymous",
        ip:
          req.headers["x-forwarded-for"]
            ?.split(",")[0] ||
          req.ip,
      };

      // Log to file
      const logFile = path.join(
        logsDir,
        "api.log"
      );
      fs.appendFileSync(
        logFile,
        JSON.stringify(logEntry) + "\n"
      );
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = {
  logSecurityEvent,
  logFailedAuth,
  logSuccessfulAuth,
  logAuthorizationFailure,
  logSensitiveOperation,
  requestLoggingMiddleware,
};
