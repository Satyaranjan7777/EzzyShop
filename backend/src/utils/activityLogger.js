import ActivityLog from "../models/ActivityLog.js";
import { getClientIp } from "../middleware/rateLimiter.middleware.js";

/**
 * Log an administrative activity non-blockingly
 * @param {Object} user - The admin user object (req.user)
 * @param {string} action - Action enum value
 * @param {string} entityType - "Product" | "Order" | "Category" | "Auth"
 * @param {string|mongoose.Types.ObjectId} entityId - Target entity ID
 * @param {string} entityTitle - Descriptive title / label
 * @param {Object} [details={}] - Extra structured context
 * @param {Object} [req=null] - Express request object for IP resolution
 */
export const logActivity = async (
  user,
  action,
  entityType,
  entityId,
  entityTitle = "",
  details = {},
  req = null
) => {
  try {
    if (!user || user.role !== "admin") return;

    const ipAddress = req ? getClientIp(req) : "127.0.0.1";

    await ActivityLog.create({
      admin: user._id,
      adminName: user.name,
      adminEmail: user.email,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      entityTitle: entityTitle || "",
      details: details || {},
      ipAddress,
    });
  } catch (err) {
    // Non-blocking: log error without interrupting the main transactional flow
    console.error("[ACTIVITY LOGGER ERROR] Failed to record admin activity:", err.message);
  }
};

export default logActivity;
