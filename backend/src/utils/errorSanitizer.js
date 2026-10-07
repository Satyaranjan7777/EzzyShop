/**
 * Error Sanitization Utility
 *
 * Ensures that:
 * 1. Stack traces, internal file paths (Windows & POSIX), and source line references are never leaked.
 * 2. Raw database driver errors (MongoDB, Mongoose, BSON) are converted to safe, generic user-facing responses.
 * 3. Operational errors (4xx) have their messages sanitized so no underlying infrastructure details are revealed.
 */

// Regex patterns to detect absolute system paths
const WINDOWS_PATH_REGEX = /[a-zA-Z]:[\\\/](?:[\w\s\.\-@]+[\\\/])*[^\s:'"`,]+/g;
const POSIX_PATH_REGEX = /(?:\/(?:Users|home|var|tmp|etc|app|usr|srv|opt|node_modules|root)\/(?:[\w\s\.\-@]+[\/])*[^\s:'"`,]+)/gi;
const FILE_URL_REGEX = /file:\/\/\/[^\s:'"`,]+/gi;
const STACK_LINE_REGEX = /^\s*at\s+.*$/gm;

// Database signatures that should never be presented to end users
const RAW_DB_PATTERNS = [
  /mongodb(?:\+srv)?:\/\/[^\s]+/i,
  /mongo(?:server|network)?error/i,
  /mongoose(?:serverselection)?error/i,
  /bson(?:error|typeindex)?/i,
  /collection:\s*[\w\.\-]+/i,
  /index:\s*[\w\.\-]+/i,
  /dup key:\s*\{/i,
  /topologydescription/i,
  /replicaset/i,
  /serverselectiontimeout/i,
  /e11000\s+duplicate\s+key/i,
  /connect\s+econnrefused/i,
];

// System filesystem error codes
const FS_ERROR_CODES = [
  "ENOENT",
  "EACCES",
  "EPERM",
  "EISDIR",
  "ENOTDIR",
  "EMFILE",
  "EBUSY",
  "EEXIST",
];

/**
 * Remove file paths, stack traces, and filesystem traces from a text string
 */
export const scrubSensitivePaths = (text) => {
  if (typeof text !== "string") return "";

  let cleaned = text
    .replace(STACK_LINE_REGEX, "")
    .replace(FILE_URL_REGEX, "[internal path]")
    .replace(WINDOWS_PATH_REGEX, "[internal path]")
    .replace(POSIX_PATH_REGEX, "[internal path]");

  return cleaned.trim();
};

/**
 * Check if an error originates from MongoDB/Mongoose or raw DB driver
 */
export const isDatabaseError = (err) => {
  if (!err) return false;

  const errorName = err.name || "";
  if (
    errorName.startsWith("Mongo") ||
    errorName.startsWith("Mongoose") ||
    errorName === "CastError" ||
    errorName === "ValidationError" ||
    errorName === "BSONError" ||
    errorName === "BSONTypeError"
  ) {
    return true;
  }

  if (err.code === 11000 || err.driver === true) {
    return true;
  }

  const message = (err.message || "").toLowerCase();
  return (
    message.includes("e11000 duplicate key") ||
    message.includes("topology was destroyed") ||
    message.includes("buffering timed out") ||
    message.includes("serverselection")
  );
};

/**
 * Check if an error message contains raw database details
 */
export const containsDatabaseDetails = (text) => {
  if (typeof text !== "string") return false;
  return RAW_DB_PATTERNS.some((pattern) => pattern.test(text));
};

/**
 * Check if an error is a filesystem error
 */
export const isFileSystemError = (err) => {
  if (!err) return false;
  if (err.code && FS_ERROR_CODES.includes(err.code)) return true;
  const message = err.message || "";
  return FS_ERROR_CODES.some((code) => message.includes(`${code}:`));
};

/**
 * Produce a safe client-facing message
 */
export const getSafeClientMessage = (err, statusCode) => {
  // If status is 500 or higher, always return generic message
  if (statusCode >= 500) {
    return "An internal server error occurred. Please try again later.";
  }

  const originalMessage = err?.message || "";

  // If message contains database driver internals, return safe generic message
  if (containsDatabaseDetails(originalMessage)) {
    return "A database operation failed. Please verify your input and try again.";
  }

  // If filesystem error or path detected, return generic message
  if (isFileSystemError(err) || originalMessage.includes("[internal path]")) {
    return "The requested resource could not be accessed.";
  }

  // Scrub any path patterns
  const scrubbed = scrubSensitivePaths(originalMessage);
  if (scrubbed.includes("[internal path]")) {
    return "Invalid resource path or identifier provided.";
  }

  return scrubbed || "Invalid request.";
};

/**
 * Sanitize an array of error messages (e.g. from validation)
 */
export const sanitizeErrorsList = (errors) => {
  if (!Array.isArray(errors)) return [];

  return errors
    .map((item) => {
      const str = typeof item === "string" ? item : (item?.message || "");
      if (containsDatabaseDetails(str) || FS_ERROR_CODES.some((c) => str.includes(c))) {
        return "Validation failed on provided field.";
      }
      const scrubbed = scrubSensitivePaths(str);
      return scrubbed.includes("[internal path]") ? "Invalid parameter format." : scrubbed;
    })
    .filter(Boolean);
};
