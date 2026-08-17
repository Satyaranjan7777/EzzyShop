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

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin-only routes
router.post(
  "/",
  authenticate,
  adminOnly,
  validate(createCategoryValidator),
  createCategory
);
router.patch(
  "/:id",
  authenticate,
  adminOnly,
  validate(updateCategoryValidator),
  updateCategory
);
router.delete("/:id", authenticate, adminOnly, deleteCategory);

export default router;
