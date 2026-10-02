const SENSITIVE_ERROR_PATTERNS = [
  /[a-zA-Z]:[\\\/]/,
  /\/(?:Users|home|var|tmp|etc|app|usr|srv|opt|node_modules)\//i,
  /file:\/\/\//i,
  /mongo(?:server|network)?error/i,
  /mongoose(?:serverselection)?error/i,
  /bson(?:error)?/i,
  /collection:\s*[\w\.\-]+/i,
  /dup key:\s*\{/i,
  /^\s*at\s+/m,
];

const isSafeErrorMessage = (msg) => {
  if (typeof msg !== "string" || !msg.trim()) return false;
  return !SENSITIVE_ERROR_PATTERNS.some((pattern) => pattern.test(msg));
};

/**
 * Extracts a user-friendly error message from an API error
 * @param {Error|Object} error
 * @param {string} fallback
 * @returns {string}
 */
export const getErrorMessage = (error, fallback = "An unexpected error occurred. Please try again.") => {
  if (!error) return fallback;

  if (error.response?.data?.message && isSafeErrorMessage(error.response.data.message)) {
    return error.response.data.message;
  }

  if (
    Array.isArray(error.response?.data?.errors) &&
    error.response.data.errors.length > 0 &&
    isSafeErrorMessage(error.response.data.errors[0])
  ) {
    return error.response.data.errors[0];
  }

  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return "Please check the entered information.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This resource already exists.";
      case 500:
        return "Server error occurred. Please try again later.";
      case 502:
      case 503:
      case 504:
        return "The backend server is warming up or temporarily unavailable. Please try again in a few moments.";
      default:
        break;
    }
  }

  if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
    return "Server is taking longer than usual to respond (it may be waking up). Please retry in a few moments.";
  }

  if (error.message === "Network Error") {
    return "Cannot connect to server. Please ensure the backend is running and reachable.";
  }

  if (error.message && isSafeErrorMessage(error.message)) {
    return error.message;
  }

  return fallback;
};

/**
 * Formats date into readable format
 * @param {string|Date} dateString
 * @param {boolean} includeTime
 * @returns {string}
 */
export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  };

  return new Intl.DateTimeFormat("en-IN", options).format(date);
};

/**
 * Truncates text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 80) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * Calculates discount percentage
 * @param {number} regularPrice
 * @param {number} discountPrice
 * @returns {number}
 */
export const calculateDiscountPercent = (regularPrice, discountPrice) => {
  if (!regularPrice || !discountPrice || discountPrice >= regularPrice) return 0;
  const saving = regularPrice - discountPrice;
  return Math.round((saving / regularPrice) * 100);
};

/**
 * Safely parses image URL with fallback
 * @param {string|Array} images
 * @returns {string}
 */
export const getPrimaryImage = (images) => {
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === "string" && images[0].trim() !== "") {
    return images[0];
  }
  if (typeof images === "string" && images.trim() !== "") {
    return images;
  }
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
};
