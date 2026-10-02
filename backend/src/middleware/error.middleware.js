import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import {
  isDatabaseError,
  isFileSystemError,
  getSafeClientMessage,
  sanitizeErrorsList,
} from "../utils/errorSanitizer.js";

/**
 * Centralized Global Error Handling Middleware
 *
 * Guarantees that:
 * 1. Full error details and stack traces are logged server-side for debugging.
 * 2. Users never see stack traces, file paths, or raw database driver errors.
 * 3. 500 errors and unhandled exceptions return safe, generic error messages.
 * 4. Input validation (400) and operational client errors return clear, sanitized feedback.
 */
export const errorHandler = (err, req, res, next) => {
  // Always log full error details, request context, and stack trace server-side
  logger.logRequestError(err, req);

  let statusCode = 500;
  let message = "An internal server error occurred. Please try again later.";
  let errors = [];

  // Determine status code
  if (err.statusCode && typeof err.statusCode === "number") {
    statusCode = err.statusCode;
  } else if (err.status && typeof err.status === "number") {
    statusCode = err.status;
  }

  // 1. Express / Body-Parser Malformed JSON syntax error
  if (err instanceof SyntaxError && (err.status === 400 || statusCode === 400) && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body.";
    return res.status(statusCode).json({ success: false, message });
  }

  // 2. CORS policy rejection
  if (err.message && err.message.toLowerCase().includes("not allowed by cors")) {
    statusCode = 403;
    message = "Request blocked by CORS policy.";
    return res.status(statusCode).json({ success: false, message });
  }

  // 3. Mongoose CastError (Bad ObjectId or invalid type conversion)
  if (err.name === "CastError") {
    statusCode = 400;
    const path = typeof err.path === "string" ? err.path.replace(/[^a-zA-Z0-9_.]/g, "") : "field";
    message = `Invalid format for field '${path}'.`;
    return res.status(statusCode).json({ success: false, message });
  }

  // 4. MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const keys = Object.keys(err.keyValue || err.keyPattern || {});
    const field = keys.length > 0 ? keys[0].replace(/[^a-zA-Z0-9_]/g, "") : "field";
    message = `A record with this ${field} already exists.`;
    return res.status(statusCode).json({ success: false, message });
  }

  // 5. Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors || {}).map((val) => {
      const field = val.path ? `${val.path}: ` : "";
      return `${field}${val.message || "Invalid value"}`;
    });
    errors = sanitizeErrorsList(errors);
    return res.status(statusCode).json({ success: false, message, errors });
  }

  // 6. JWT Authentication Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please authenticate again.";
    return res.status(statusCode).json({ success: false, message });
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired. Please log in again.";
    return res.status(statusCode).json({ success: false, message });
  }

  // 7. BSON serialization/deserialization errors
  if (err.name === "BSONError" || err.name === "BSONTypeError") {
    statusCode = 400;
    message = "Invalid identifier format.";
    return res.status(statusCode).json({ success: false, message });
  }

  // 8. Other Raw Database Driver Errors (e.g. MongoServerError, connection timeouts)
  if (isDatabaseError(err)) {
    statusCode = 500;
    message = "A database error occurred. Please try again later.";
    return res.status(statusCode).json({ success: false, message });
  }

  // 9. Filesystem Errors (e.g. ENOENT, EACCES)
  if (isFileSystemError(err)) {
    statusCode = 500;
    message = "An error occurred while accessing the requested resource.";
    return res.status(statusCode).json({ success: false, message });
  }

  // 10. Operational ApiErrors (status < 500)
  if (err instanceof ApiError && statusCode < 500) {
    message = getSafeClientMessage(err, statusCode);
    errors = sanitizeErrorsList(err.errors);
    const response = {
      success: false,
      message,
      ...(errors.length > 0 && { errors }),
    };
    return res.status(statusCode).json(response);
  }

  // 11. Generic 500 or unknown non-operational exceptions
  // Users NEVER see stack traces, raw system exceptions, or internal file paths
  statusCode = statusCode >= 400 && statusCode < 500 ? statusCode : 500;
  message =
    statusCode < 500
      ? getSafeClientMessage(err, statusCode)
      : "An internal server error occurred. Please try again later.";

  const response = {
    success: false,
    message,
  };

  return res.status(statusCode).json(response);
};

export default errorHandler;
