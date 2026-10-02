import express from "express";
import { getHealthStatus } from "../controllers/health.controller.js";
import { publicLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

/**
 * @route   GET /health or GET /api/v1/health
 * @desc    Get API health status, database connection, and system metrics
 * @access  Public
 */
router.get("/", publicLimiter, getHealthStatus);

export default router;
