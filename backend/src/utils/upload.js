import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import ApiError from "./ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists outside web root
export const UPLOADS_DIR = path.resolve(__dirname, "../../storage/uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Strict whitelist of allowed image MIME types and corresponding extensions
const ALLOWED_MIME_TYPES = new Map([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/webp", [".webp"]],
  ["image/gif", [".gif"]],
]);

// Maximum file size: 5 MB
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate safe, collision-resistant cryptographic random filename
    const randomSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = ALLOWED_MIME_TYPES.get(mimeType);

  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    return cb(
      new ApiError(
        400,
        "Invalid file type. Only JPEG, PNG, WEBP, and GIF images up to 5MB are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * Detects image format by inspecting magic bytes in the file buffer.
 * Reads the first 16 bytes of the file.
 *
 * @param {Buffer} buffer - Buffer containing at least the first 16 bytes of the file
 * @returns {string|null} - Detected MIME type ('image/jpeg', 'image/png', 'image/gif', 'image/webp') or null if invalid
 */
export const detectImageMimeType = (buffer) => {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // JPEG signature: FF D8 FF
  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  // GIF signature: GIF87a or GIF89a (47 49 46 38 37/39 61)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  // WEBP signature: 'RIFF' .... 'WEBP'
  // Bytes 0-3: 52 49 46 46 (RIFF), Bytes 8-11: 57 45 42 50 (WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
};

/**
 * Validates that an uploaded file on disk actually contains the binary signature
 * corresponding to its claimed MIME type.
 *
 * @param {string} filePath - Absolute path to the uploaded file on disk
 * @param {string} expectedMime - Expected MIME type
 * @returns {Promise<boolean>}
 */
export const validateImageContent = async (filePath, expectedMime) => {
  let fileHandle;
  try {
    fileHandle = await fs.promises.open(filePath, "r");
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await fileHandle.read(buffer, 0, 16, 0);
    await fileHandle.close();
    fileHandle = null;

    if (bytesRead < 12) {
      return false;
    }

    const detectedMime = detectImageMimeType(buffer);
    return detectedMime === expectedMime;
  } catch (error) {
    if (fileHandle) {
      await fileHandle.close().catch(() => {});
    }
    return false;
  }
};

/**
 * Express middleware to validate binary magic bytes of an uploaded file.
 * If validation fails, immediately deletes the temporary/stored file from disk.
 */
export const validateUploadedFileContent = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const isValid = await validateImageContent(
      req.file.path,
      req.file.mimetype.toLowerCase()
    );

    if (!isValid) {
      // Purge corrupt or malicious file from disk
      await fs.promises.unlink(req.file.path).catch(() => {});
      return next(
        new ApiError(
          400,
          "Invalid file content. The uploaded file does not match an authentic image signature."
        )
      );
    }

    next();
  } catch (err) {
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    next(err);
  }
};

export default uploadImage;
