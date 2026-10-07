import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";
import { idParamValidator } from "../validators/common.validator.js";
import {
  publicLimiter,
  userLimiter,
} from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Public routes (moderate rate limit with strict validation)
router.get("/", publicLimiter, getCategories);
router.get("/:id", publicLimiter, validate(idParamValidator), getCategoryById);

// Admin-only routes (looser authenticated rate limit with strict validation)
router.post(
  "/",
  authenticate,
  adminOnly,
  userLimiter,
  validate(createCategoryValidator),
  createCategory
);
router.patch(
  "/:id",
  authenticate,
  adminOnly,
  userLimiter,
  validate(idParamValidator),
  validate(updateCategoryValidator),
  updateCategory
);
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  userLimiter,
  validate(idParamValidator),
  deleteCategory
);

export default router;
