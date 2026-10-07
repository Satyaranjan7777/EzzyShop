import schema from "./schema.js";

/**
 * Strict schema for Creating an Address
 */
const createAddressBodySchema = schema
  .object({
    fullName: schema
      .string()
      .min(2, "Full name is required and must be at least 2 characters long")
      .max(60, "Full name cannot exceed 60 characters"),
    phone: schema.phone(
      "A valid 10-digit Indian mobile number (+91 or starting with 6, 7, 8, 9) is required"
    ),
    addressLine: schema
      .string()
      .min(3, "Address line is required and must be at least 3 characters long")
      .max(200, "Address line cannot exceed 200 characters"),
    city: schema
      .string()
      .min(2, "City is required and must be at least 2 characters long")
      .max(50, "City cannot exceed 50 characters"),
    state: schema
      .string()
      .min(2, "State is required and must be at least 2 characters long")
      .max(50, "State cannot exceed 50 characters"),
    pincode: schema.pincode("A valid 6-digit Indian PIN code is required"),
    country: schema
      .string()
      .min(2, "Country must be at least 2 characters long")
      .max(50, "Country cannot exceed 50 characters")
      .optional(),
    isDefault: schema.boolean().optional(),
  })
  .strict();

export const createAddressValidator = (req) => {
  const errors = [];
  createAddressBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Updating an Address
 */
const updateAddressBodySchema = schema
  .object({
    fullName: schema
      .string()
      .min(2, "Full name must be at least 2 characters long")
      .max(60, "Full name cannot exceed 60 characters")
      .optional(),
    phone: schema
      .phone(
        "Please provide a valid 10-digit Indian mobile number (+91 or starting with 6, 7, 8, 9)"
      )
      .optional(),
    addressLine: schema
      .string()
      .min(3, "Address line must be at least 3 characters long")
      .max(200, "Address line cannot exceed 200 characters")
      .optional(),
    city: schema
      .string()
      .min(2, "City must be at least 2 characters long")
      .max(50, "City cannot exceed 50 characters")
      .optional(),
    state: schema
      .string()
      .min(2, "State must be at least 2 characters long")
      .max(50, "State cannot exceed 50 characters")
      .optional(),
    pincode: schema
      .pincode("Please provide a valid 6-digit Indian PIN code")
      .optional(),
    country: schema
      .string()
      .min(2, "Country must be at least 2 characters long")
      .max(50, "Country cannot exceed 50 characters")
      .optional(),
    isDefault: schema.boolean().optional(),
  })
  .minKeys(1, "At least one field must be provided for address update")
  .strict();

export const updateAddressValidator = (req) => {
  const errors = [];
  updateAddressBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

export default {
  createAddressValidator,
  updateAddressValidator,
};
