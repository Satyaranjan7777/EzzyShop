import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createAddressValidator,
  updateAddressValidator,
} from "../validators/address.validator.js";

const router = express.Router();

// All address routes require authentication
router.use(authenticate);

router.get("/", getAddresses);
router.post("/", validate(createAddressValidator), createAddress);
router.patch("/:id", validate(updateAddressValidator), updateAddress);
router.delete("/:id", deleteAddress);

export default router;
