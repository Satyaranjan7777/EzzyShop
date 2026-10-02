import schema from "./schema.js";

/**
 * Strict schema for User Registration
 * Enforces type, length, format, and rejects unknown properties.
 */
const registerBodySchema = schema.object({
  name: schema
    .string()
    .min(2, "Name is required and must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters"),
  email: schema.email("A valid email address is required"),
  password: schema
    .string()
    .min(8, "Password is required and must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters"),
  role: schema
    .enum(["user"], "Public registration cannot assign elevated roles")
    .optional(),
}).strict();

export const registerValidator = (req) => {
  const errors = [];
  registerBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for User Login
 * Enforces type, length, format, and rejects unknown properties.
 */
const loginBodySchema = schema.object({
  email: schema.email("A valid email address is required"),
  password: schema
    .string()
    .min(1, "Password is required")
    .max(128, "Password cannot exceed 128 characters"),
}).strict();

export const loginValidator = (req) => {
  const errors = [];
  loginBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

export default {
  registerValidator,
  loginValidator,
};
