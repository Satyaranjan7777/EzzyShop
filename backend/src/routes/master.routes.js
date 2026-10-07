import express from "express";
import {
  masterLogin,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getMasterOverview,
  getAdminActivities,
  getSingleAdminActivities,
} from "../controllers/master.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { masterOnly } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimiter, userLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  masterLoginValidator,
  createAdminValidator,
  updateAdminValidator,
} from "../validators/master.validator.js";
import { idParamValidator } from "../validators/common.validator.js";

const router = express.Router();

/**
 * @route   POST /api/v1/master/login
 * @desc    Master account authentication
 * @access  Public (Restricted to master role)
 */
router.post(
  "/login",
  authLimiter,
  validate(masterLoginValidator),
  masterLogin
);

/**
 * @route   GET /api/v1/master/overview
 * @desc    Get platform-wide overview metrics for Master
 * @access  Private (Master Only)
 */
router.get(
  "/overview",
  authenticate,
  masterOnly,
  userLimiter,
  getMasterOverview
);

/**
 * @route   GET /api/v1/master/activities
 * @desc    Get admin activity audit logs across the platform
 * @access  Private (Master Only)
 */
router.get(
  "/activities",
  authenticate,
  masterOnly,
  userLimiter,
  getAdminActivities
);

/**
 * @route   GET /api/v1/master/admins
 * @desc    List all system admins
 * @access  Private (Master Only)
 */
router.get(
  "/admins",
  authenticate,
  masterOnly,
  userLimiter,
  getAdmins
);

/**
 * @route   POST /api/v1/master/admins
 * @desc    Create a new admin user
 * @access  Private (Master Only)
 */
router.post(
  "/admins",
  authenticate,
  masterOnly,
  userLimiter,
  validate(createAdminValidator),
  createAdmin
);

/**
 * @route   GET /api/v1/master/admins/:id
 * @desc    Get single admin details
 * @access  Private (Master Only)
 */
router.get(
  "/admins/:id",
  authenticate,
  masterOnly,
  userLimiter,
  validate(idParamValidator),
  getAdminById
);

/**
 * @route   GET /api/v1/master/admins/:id/activities
 * @desc    Get activity audit logs of a specific admin
 * @access  Private (Master Only)
 */
router.get(
  "/admins/:id/activities",
  authenticate,
  masterOnly,
  userLimiter,
  validate(idParamValidator),
  getSingleAdminActivities
);

/**
 * @route   PUT /api/v1/master/admins/:id
 * @desc    Update admin (status, name, password, email)
 * @access  Private (Master Only)
 */
router.put(
  "/admins/:id",
  authenticate,
  masterOnly,
  userLimiter,
  validate(idParamValidator),
  validate(updateAdminValidator),
  updateAdmin
);

/**
 * @route   DELETE /api/v1/master/admins/:id
 * @desc    Delete an admin account
 * @access  Private (Master Only)
 */
router.delete(
  "/admins/:id",
  authenticate,
  masterOnly,
  userLimiter,
  validate(idParamValidator),
  deleteAdmin
);

export default router;
