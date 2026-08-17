import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token has expired, please log in again");
    }
    throw new ApiError(401, "Invalid token, authorization denied");
  }

  const user = await User.findById(decoded.id || decoded._id).select("-password");

  if (!user) {
    throw new ApiError(401, "User belonging to this token no longer exists");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive. Please contact support.");
  }

  req.user = user;
  next();
});

// Alias for protect
export const protect = authenticate;
