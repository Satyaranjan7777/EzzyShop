import dotenv from "dotenv";

// Ensure environment variables are loaded silently
dotenv.config({ quiet: true });

/**
 * Safely parse integer from environment variable with fallback default
 */
const parseEnvInt = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Safely parse float from environment variable with fallback default
 */
const parseEnvFloat = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Rate Limiting Configuration
 * All limits and windows are completely configurable via environment variables.
 */
export const rateLimitConfig = {
  // Global master switch: set RATE_LIMIT_ENABLED=false to bypass rate limiting (e.g. in test/CI)
  enabled: process.env.RATE_LIMIT_ENABLED !== "false",

  // Authentication routes (Strict with exponential backoff and dual IP + Account limits)
  auth: {
    // Sliding window for tracking attempts (default: 15 minutes)
    windowMs: parseEnvInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 15 * 60 * 1000),

    // Max allowed attempts per client IP before backoff kicks in (default: 10 attempts)
    ipMax: parseEnvInt(process.env.RATE_LIMIT_AUTH_IP_MAX, 10),

    // Max allowed attempts per account identifier before backoff kicks in (default: 5 attempts)
    accountMax: parseEnvInt(process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX, 5),

    // Initial base delay for exponential backoff (default: 1000 ms = 1 second)
    baseDelayMs: parseEnvInt(process.env.RATE_LIMIT_AUTH_BASE_DELAY_MS, 1000),

    // Multiplier for exponential backoff: baseDelay * (factor ^ excessAttempts) (default: 2)
    backoffFactor: parseEnvFloat(process.env.RATE_LIMIT_AUTH_BACKOFF_FACTOR, 2),

    // Maximum cap on exponential backoff delay (default: 15 minutes)
    maxDelayMs: parseEnvInt(process.env.RATE_LIMIT_AUTH_MAX_DELAY_MS, 15 * 60 * 1000),

    // Automatically reset account attempt tracker when authentication succeeds (default: true)
    resetOnSuccess: process.env.RATE_LIMIT_AUTH_RESET_ON_SUCCESS !== "false",
  },

  // Public unauthenticated endpoints (Moderate limits, IP-based)
  public: {
    // Sliding window duration (default: 15 minutes)
    windowMs: parseEnvInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS, 15 * 60 * 1000),

    // Max requests per window per IP (default: 100 requests)
    max: parseEnvInt(process.env.RATE_LIMIT_PUBLIC_MAX, 100),

    // User-facing error message on rate limit exceeded
    message:
      process.env.RATE_LIMIT_PUBLIC_MESSAGE ||
      "Too many requests from this IP. Please try again later.",
  },

  // Authenticated user actions (Looser limits, User ID-based with IP fallback)
  user: {
    // Sliding window duration (default: 15 minutes)
    windowMs: parseEnvInt(process.env.RATE_LIMIT_USER_WINDOW_MS, 15 * 60 * 1000),

    // Max requests per window per user (default: 500 requests)
    max: parseEnvInt(process.env.RATE_LIMIT_USER_MAX, 500),

    // User-facing error message on rate limit exceeded
    message:
      process.env.RATE_LIMIT_USER_MESSAGE ||
      "Too many requests for this account. Please slow down.",
  },
};

export default rateLimitConfig;
