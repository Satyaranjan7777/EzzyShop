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
} from "../validators/product.validator.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes
router.post(
  "/",
  authenticate,
  adminOnly,
  validate(createProductValidator),
  createProduct
);
router.patch(
  "/:id",
  authenticate,
  adminOnly,
  validate(updateProductValidator),
  updateProduct
);
router.delete("/:id", authenticate, adminOnly, deleteProduct);

export default router;
