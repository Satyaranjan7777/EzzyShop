import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createProductValidator,
  updateProductValidator,
  getProductsQueryValidator,
} from "../validators/product.validator.js";
import { idParamValidator } from "../validators/common.validator.js";
import {
  publicLimiter,
  userLimiter,
} from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Public routes (moderate rate limit with strict validation)
router.get("/", publicLimiter, validate(getProductsQueryValidator), getProducts);
router.get("/:id", publicLimiter, validate(idParamValidator), getProductById);

// Admin-only routes (looser authenticated rate limit with strict validation)
router.post(
  "/",
  authenticate,
  adminOnly,
  userLimiter,
  validate(createProductValidator),
  createProduct
);
router.patch(
  "/:id",
  authenticate,
  adminOnly,
  userLimiter,
  validate(idParamValidator),
  validate(updateProductValidator),
  updateProduct
);
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  userLimiter,
  validate(idParamValidator),
  deleteProduct
);

export default router;
