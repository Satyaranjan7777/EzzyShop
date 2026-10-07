import schema from "./schema.js";

/**
 * Strict schema for Adding Items to Cart
 */
const addToCartBodySchema = schema
  .object({
    productId: schema.objectId("A valid 24-character product ID is required"),
    quantity: schema
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be a positive integer of at least 1")
      .max(100, "Quantity cannot exceed 100 items per product")
      .optional(),
  })
  .strict();

export const addToCartValidator = (req) => {
  const errors = [];
  addToCartBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Updating Cart Item Quantity
 */
const updateCartItemBodySchema = schema
  .object({
    quantity: schema
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity is required and must be a positive integer of at least 1")
      .max(100, "Quantity cannot exceed 100 items per product"),
  })
  .strict();

export const updateCartItemValidator = (req) => {
  const errors = [];

  // Check productId parameter in URL if present
  if (req.params && req.params.productId) {
    schema.objectId("Invalid product ID in URL parameters").validate(
      req.params.productId,
      "params.productId",
      errors
    );
  }

  updateCartItemBodySchema.validate(req.body || {}, "body", errors);

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

export default {
  addToCartValidator,
  updateCartItemValidator,
};
