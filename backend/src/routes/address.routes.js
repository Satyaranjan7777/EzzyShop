import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { userLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  createAddressValidator,
  updateAddressValidator,
} from "../validators/address.validator.js";
import { idParamValidator } from "../validators/common.validator.js";

const router = express.Router();

// All address routes require authentication & use looser authenticated user rate limiter
router.use(authenticate);
router.use(userLimiter);

router.get("/", getAddresses);
router.post("/", validate(createAddressValidator), createAddress);
router.patch(
  "/:id",
  validate(idParamValidator),
  validate(updateAddressValidator),
  updateAddress
);
router.delete("/:id", validate(idParamValidator), deleteAddress);

export default router;
