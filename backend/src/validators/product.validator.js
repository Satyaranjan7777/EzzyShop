import schema from "./schema.js";

/**
 * Image item validator: accepts absolute HTTP/HTTPS URLs or valid relative upload paths (/uploads/...)
 */
const imageItemSchema = schema
  .string()
  .min(5, "Image URL or path must be at least 5 characters long")
  .max(1000, "Image URL cannot exceed 1000 characters")
  .refine(
    (val) =>
      typeof val === "string" &&
      (/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(val) || /^\/uploads\/[a-zA-Z0-9.\-_]+$/i.test(val)),
    "Each image must be a valid http or https URL or an uploaded image path"
  );

/**
 * Strict schema for Creating a Product
 */
const createProductBodySchema = schema
  .object({
    title: schema
      .string()
      .min(2, "Product title is required and must be at least 2 characters long")
      .max(150, "Product title cannot exceed 150 characters"),
    slug: schema.slug().optional(),
    description: schema
      .string()
      .min(5, "Product description is required and must be at least 5 characters long")
      .max(5000, "Product description cannot exceed 5000 characters"),
    price: schema
      .number()
      .min(0.01, "Price is required and must be a positive number greater than 0")
      .max(10000000, "Price cannot exceed 10,000,000"),
    discountPrice: schema
      .number()
      .min(0, "Discount price must be a valid non-negative number")
      .max(10000000, "Discount price cannot exceed 10,000,000")
      .nullable()
      .optional(),
    category: schema.objectId("A valid 24-character category ID is required"),
    images: schema
      .array(imageItemSchema)
      .min(0)
      .max(10, "Cannot upload more than 10 images")
      .optional(),
    stock: schema
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock is required and must be a non-negative number")
      .max(1000000, "Stock cannot exceed 1,000,000"),
    isActive: schema.boolean().optional(),
  })
  .strict()
  .refine((body) => {
    if (
      body.discountPrice !== undefined &&
      body.discountPrice !== null &&
      body.price !== undefined
    ) {
      return body.discountPrice < body.price;
    }
    return true;
  }, "Discount price must be strictly less than the regular price");

export const createProductValidator = (req) => {
  const errors = [];
  createProductBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Updating a Product
 */
const updateProductBodySchema = schema
  .object({
    title: schema
      .string()
      .min(2, "Product title must be at least 2 characters long")
      .max(150, "Product title cannot exceed 150 characters")
      .optional(),
    slug: schema.slug().optional(),
    description: schema
      .string()
      .min(5, "Product description must be at least 5 characters long")
      .max(5000, "Product description cannot exceed 5000 characters")
      .optional(),
    price: schema
      .number()
      .min(0.01, "Price must be a positive number greater than 0")
      .max(10000000, "Price cannot exceed 10,000,000")
      .optional(),
    discountPrice: schema
      .number()
      .min(0, "Discount price must be a valid non-negative number")
      .max(10000000, "Discount price cannot exceed 10,000,000")
      .nullable()
      .optional(),
    category: schema.objectId("Invalid category ID format").optional(),
    images: schema
      .array(imageItemSchema)
      .min(0)
      .max(10, "Cannot exceed 10 images")
      .optional(),
    stock: schema
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock must be a non-negative number")
      .max(1000000, "Stock cannot exceed 1,000,000")
      .optional(),
    isActive: schema.boolean().optional(),
  })
  .minKeys(1, "At least one field must be provided for product update")
  .strict()
  .refine((body) => {
    if (
      body.discountPrice !== undefined &&
      body.discountPrice !== null &&
      body.price !== undefined
    ) {
      return body.discountPrice < body.price;
    }
    return true;
  }, "Discount price must be strictly less than the regular price");

export const updateProductValidator = (req) => {
  const errors = [];
  updateProductBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Product Query Filters
 */
const getProductsQuerySchema = schema
  .object({
    page: schema.number().allowNumericString().int().min(1).max(10000).optional(),
    limit: schema.number().allowNumericString().int().min(1).max(100).optional(),
    search: schema.string().min(1).max(100).optional(),
    category: schema.string().min(1).max(60).optional(),
    sort: schema
      .enum([
        "price",
        "price_asc",
        "-price",
        "price_desc",
        "title",
        "title_asc",
        "-title",
        "title_desc",
        "newest",
        "-createdAt",
        "oldest",
        "createdAt",
      ])
      .optional(),
    minPrice: schema.number().allowNumericString().min(0).optional(),
    maxPrice: schema.number().allowNumericString().min(0).optional(),
    inStock: schema.enum(["true", "false"]).optional(),
  })
  .strict();

export const getProductsQueryValidator = (req) => {
  const errors = [];
  getProductsQuerySchema.validate(req.query || {}, "query", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

export default {
  createProductValidator,
  updateProductValidator,
  getProductsQueryValidator,
};
