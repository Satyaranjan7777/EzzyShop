import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";
import { authLimiter, userLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerValidator), registerUser);
router.post("/login", authLimiter, validate(loginValidator), loginUser);
router.get("/me", authenticate, userLimiter, getMe);

export default router;
