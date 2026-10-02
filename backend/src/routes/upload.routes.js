import express from "express";
import { uploadImage, validateUploadedFileContent } from "../utils/upload.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/role.middleware.js";
import { userLimiter } from "../middleware/rateLimiter.middleware.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const router = express.Router();

// File upload endpoint (Admin only, rate limited)
router.post(
  "/",
  authenticate,
  adminOnly,
  userLimiter,
  (req, res, next) => {
    uploadImage.single("image")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(400, "File size exceeds the 5MB limit"));
        }
        return next(err);
      }
      if (!req.file) {
        return next(new ApiError(400, "Please upload an image file using field 'image'"));
      }
      next();
    });
  },
  validateUploadedFileContent,
  (req, res) => {
    const fileUrl = `/uploads/${req.file.filename}`;
    return new ApiResponse(201, "Image uploaded successfully", {
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    }).send(res);
  }
);

export default router;
