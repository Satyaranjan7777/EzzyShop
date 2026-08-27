import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createOrderValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
} from "../validators/order.validator.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User order endpoints
router.post("/", validate(createOrderValidator), createOrder);
router.get("/my-orders", getMyOrders);
router.patch("/:id/cancel", validate(cancelOrderValidator), cancelOrder);

// Admin-only endpoints
router.get("/", adminOnly, getAllOrders);
router.patch(
  "/:id/status",
  adminOnly,
  validate(updateOrderStatusValidator),
  updateOrderStatus
);

// Single order endpoint (User can view own, Admin can view any)
router.get("/:id", getOrderById);

export default router;
