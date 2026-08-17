import ApiError from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not already an ApiError instance, convert it
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
    let errors = [];

    // Mongoose bad ObjectId (CastError)
    if (error.name === "CastError") {
      statusCode = 400;
      message = `Invalid format for field '${error.path}': ${error.value}`;
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
      statusCode = 400;
      const keys = Object.keys(error.keyValue || {});
      message = `Duplicate field value entered: ${keys.join(", ")} already exists`;
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      statusCode = 400;
      message = "Validation Error";
      errors = Object.values(error.errors || {}).map((val) => val.message);
    }

    // JWT verification errors
    if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token. Please authenticate again.";
    }

    if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token has expired. Please log in again.";
    }

    error = new ApiError(statusCode, message, errors, error.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode || 500).json(response);
};
