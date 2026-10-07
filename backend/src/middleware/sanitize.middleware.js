/**
 * NoSQL Injection Sanitization Middleware
 *
 * Recursively inspects request bodies, query strings, and parameters.
 * Strips keys prefixed with '$' (MongoDB operator injection) or containing '.'
 * to prevent operator injection attacks across all endpoints.
 */

export const sanitizeData = (data) => {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      sanitizeData(data[i]);
    }
    return data;
  }

  for (const key of Object.keys(data)) {
    // Disallow MongoDB operators ($where, $gt, $ne, etc.) or object dot-notation paths
    if (key.startsWith("$") || key.includes(".")) {
      delete data[key];
    } else if (typeof data[key] === "object" && data[key] !== null) {
      sanitizeData(data[key]);
    }
  }

  return data;
};

export const mongoSanitize = (req, res, next) => {
  if (req.body) {
    sanitizeData(req.body);
  }
  if (req.query) {
    sanitizeData(req.query);
  }
  if (req.params) {
    sanitizeData(req.params);
  }
  next();
};

export default mongoSanitize;
