import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { userLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  addToCartValidator,
  updateCartItemValidator,
} from "../validators/cart.validator.js";
import { productIdParamValidator } from "../validators/common.validator.js";

const router = express.Router();

// All cart routes require authentication & use authenticated user rate limiter
router.use(authenticate);
router.use(userLimiter);

router.get("/", getCart);
router.post("/items", validate(addToCartValidator), addToCart);
router.patch(
  "/items/:productId",
  validate(productIdParamValidator),
  validate(updateCartItemValidator),
  updateCartItem
);
router.delete(
  "/items/:productId",
  validate(productIdParamValidator),
  removeCartItem
);
router.delete("/", clearCart);

export default router;
