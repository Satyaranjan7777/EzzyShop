import schema from "./schema.js";

/**
 * Strict schema for nested shipping address
 */
const shippingAddressSchema = schema
  .object({
    fullName: schema
      .string()
      .min(2, "Shipping address full name is required and must be at least 2 characters long")
      .max(60, "Shipping address full name cannot exceed 60 characters"),
    phone: schema.phone(
      "Valid 10-digit Indian shipping phone number is required (e.g. +91 9876543210 or 9876543210)"
    ),
    addressLine: schema
      .string()
      .min(3, "Shipping address line is required and must be at least 3 characters long")
      .max(200, "Shipping address line cannot exceed 200 characters"),
    city: schema
      .string()
      .min(2, "Shipping address city is required and must be at least 2 characters long")
      .max(50, "Shipping address city cannot exceed 50 characters"),
    state: schema
      .string()
      .min(2, "Shipping address state is required and must be at least 2 characters long")
      .max(50, "Shipping address state cannot exceed 50 characters"),
    pincode: schema.pincode("A valid 6-digit Indian shipping pincode is required"),
    country: schema
      .string()
      .min(2, "Shipping address country must be at least 2 characters long")
      .max(50, "Shipping address country cannot exceed 50 characters")
      .optional(),
  })
  .strict();

/**
 * Strict schema for Creating an Order
 */
const createOrderBodySchema = schema
  .object({
    addressId: schema.objectId("Invalid addressId format").optional(),
    shippingAddress: shippingAddressSchema.optional(),
    paymentMethod: schema
      .enum(["COD"], "Only COD (Cash on Delivery) is currently supported as payment method")
      .optional(),
  })
  .strict()
  .refine((body) => {
    const hasAddressId = Boolean(body.addressId);
    const hasShippingAddress = Boolean(body.shippingAddress);
    return hasAddressId || hasShippingAddress;
  }, "Either a valid addressId or a shippingAddress object must be provided");

export const createOrderValidator = (req) => {
  const errors = [];
  createOrderBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Updating Order Status
 */
const updateOrderStatusBodySchema = schema
  .object({
    orderStatus: schema.enum(
      [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      "Order status must be one of: pending, confirmed, processing, shipped, delivered, cancelled"
    ),
    reason: schema
      .string()
      .min(1, "Cancellation reason cannot be empty")
      .max(250, "Cancellation reason cannot exceed 250 characters")
      .optional(),
  })
  .strict();

export const updateOrderStatusValidator = (req) => {
  const errors = [];
  updateOrderStatusBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Cancelling an Order
 */
const cancelOrderBodySchema = schema
  .object({
    reason: schema
      .string()
      .min(1, "Cancellation reason cannot be empty")
      .max(250, "Cancellation reason cannot exceed 250 characters")
      .optional(),
  })
  .strict();

export const cancelOrderValidator = (req) => {
  const errors = [];
  cancelOrderBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

export default {
  createOrderValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
};
