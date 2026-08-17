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
import {
  addToCartValidator,
  updateCartItemValidator,
} from "../validators/cart.validator.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", getCart);
router.post("/items", validate(addToCartValidator), addToCart);
router.patch("/items/:productId", validate(updateCartItemValidator), updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
