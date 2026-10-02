/**
 * Centralized Server-Side Logging Utility
 *
 * Provides structured, timestamped console and stream logging for production
 * and development environments. Logs full error stacks and contextual request
 * information server-side while redacting sensitive authentication credentials
 * (passwords, tokens, API keys).
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "confirmpassword",
  "currentpassword",
  "newpassword",
  "token",
  "refreshtoken",
  "authorization",
  "secret",
  "creditcard",
  "cardnumber",
  "cvv",
  "cvc",
  "pin",
]);

/**
 * Deeply clone and mask sensitive data keys in objects before logging
 */
export const sanitizeForLogging = (data, depth = 0) => {
  if (depth > 4 || data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForLogging(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeForLogging(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const formatTimestamp = () => new Date().toISOString();

export const logger = {
  /**
   * Log informational message
   */
  info: (message, meta = null) => {
    const timestamp = formatTimestamp();
    if (meta) {
      console.log(`[${timestamp}] [INFO] ${message}`, sanitizeForLogging(meta));
    } else {
      console.log(`[${timestamp}] [INFO] ${message}`);
    }
  },

  /**
   * Log warning message (e.g. 4xx operational errors, rate limit triggers)
   */
  warn: (message, meta = null) => {
    const timestamp = formatTimestamp();
    if (meta) {
      console.warn(`[${timestamp}] [WARN] ${message}`, sanitizeForLogging(meta));
    } else {
      console.warn(`[${timestamp}] [WARN] ${message}`);
    }
  },

  /**
   * Log critical server-side error with full stack trace and metadata
   */
  error: (message, meta = null) => {
    const timestamp = formatTimestamp();
    if (meta) {
      if (meta instanceof Error) {
        console.error(
          `[${timestamp}] [ERROR] ${message} - ${meta.name}: ${meta.message}\nStack: ${meta.stack}`
        );
      } else {
        console.error(`[${timestamp}] [ERROR] ${message}`, sanitizeForLogging(meta));
      }
    } else {
      console.error(`[${timestamp}] [ERROR] ${message}`);
    }
  },

  /**
   * Log debug message (active when DEBUG=true or NODE_ENV=development)
   */
  debug: (message, meta = null) => {
    if (process.env.NODE_ENV === "production" && !process.env.DEBUG) return;
    const timestamp = formatTimestamp();
    if (meta) {
      console.debug(`[${timestamp}] [DEBUG] ${message}`, sanitizeForLogging(meta));
    } else {
      console.debug(`[${timestamp}] [DEBUG] ${message}`);
    }
  },

  /**
   * Structured error logging for HTTP requests reaching error handling middleware
   */
  logRequestError: (err, req) => {
    const timestamp = formatTimestamp();
    const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
    const isServerError = statusCode >= 500;
    const method = req?.method || "UNKNOWN";
    const url = req?.originalUrl || req?.url || "UNKNOWN";
    const ip = req?.ip || req?.headers?.["x-forwarded-for"] || "UNKNOWN";
    const userId = req?.user?._id || req?.user?.id || "anonymous";

    const context = {
      statusCode,
      method,
      url,
      ip,
      userId,
      errorName: err.name || "Error",
      errorMessage: err.message,
    };

    if (req?.body && Object.keys(req.body).length > 0) {
      context.body = sanitizeForLogging(req.body);
    }
    if (req?.query && Object.keys(req.query).length > 0) {
      context.query = sanitizeForLogging(req.query);
    }
    if (req?.params && Object.keys(req.params).length > 0) {
      context.params = sanitizeForLogging(req.params);
    }

    if (isServerError) {
      console.error(
        `\n[${timestamp}] [SERVER_ERROR ${statusCode}] ${method} ${url} (User: ${userId}, IP: ${ip})\n` +
        `  Name: ${err.name || "Error"}\n` +
        `  Message: ${err.message}\n` +
        `  Stack: ${err.stack || "No stack trace available"}\n` +
        `  Context: ${JSON.stringify(context, null, 2)}\n`
      );
    } else {
      // 4xx operational issues - log summary warning
      console.warn(
        `[${timestamp}] [CLIENT_ERROR ${statusCode}] ${method} ${url} - ${err.message} (IP: ${ip})`
      );
    }
  },
};

export default logger;
