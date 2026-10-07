import schema from "./schema.js";

/**
 * Strict schema for Master Login
 */
const masterLoginBodySchema = schema
  .object({
    email: schema.email("A valid email address is required"),
    password: schema
      .string()
      .min(1, "Password is required")
      .max(128, "Password cannot exceed 128 characters"),
  })
  .strict();

export const masterLoginValidator = (req) => {
  const errors = [];
  masterLoginBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Creating an Admin
 */
const createAdminBodySchema = schema
  .object({
    name: schema
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name cannot exceed 50 characters"),
    email: schema.email("A valid email address is required"),
    password: schema
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters"),
  })
  .strict();

export const createAdminValidator = (req) => {
  const errors = [];
  createAdminBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Updating an Admin
 */
const updateAdminBodySchema = schema
  .object({
    name: schema
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),
    email: schema.email("A valid email address is required").optional(),
    password: schema
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters")
      .optional(),
    isActive: schema.boolean("isActive must be a boolean").optional(),
  })
  .strict();

export const updateAdminValidator = (req) => {
  const errors = [];
  updateAdminBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

export default {
  masterLoginValidator,
  createAdminValidator,
  updateAdminValidator,
};
