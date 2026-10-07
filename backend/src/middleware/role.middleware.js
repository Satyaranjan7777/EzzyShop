import ApiError from "../utils/ApiError.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authorized, user not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "Access denied. You do not have permission to perform this action"
        )
      );
    }

    next();
  };
};

// Operational Admin-only actions (strictly cannot be executed by Master)
export const adminOnly = authorize("admin");

// Master-only governance actions (strictly cannot be executed by standard Admin)
export const masterOnly = authorize("master");

// Shared oversight actions (accessible to both Operational Admin and Master)
export const adminOrMaster = authorize("admin", "master");

/**
 * Enterprise Separation of Duties:
 * Strictly prevents Master accounts from mutating products, inventory, or pricing.
 */
export const forbidMasterCatalogModification = (req, res, next) => {
  if (req.user && req.user.role === "master") {
    return next(
      new ApiError(
        403,
        "Access denied: Master accounts have oversight & governance privileges only. Catalog product modifications are strictly restricted to Operational Admins."
      )
    );
  }
  next();
};
