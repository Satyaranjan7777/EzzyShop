import schema from "./schema.js";

/**
 * Strict schema for Creating a Category
 */
const createCategoryBodySchema = schema.object({
  name: schema
    .string()
    .min(2, "Category name is required and must be at least 2 characters long")
    .max(50, "Category name cannot exceed 50 characters"),
  slug: schema.slug("Slug must contain only lowercase alphanumeric characters and hyphens").optional(),
  isActive: schema.boolean().optional(),
}).strict();

export const createCategoryValidator = (req) => {
  const errors = [];
  createCategoryBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

/**
 * Strict schema for Updating a Category
 */
const updateCategoryBodySchema = schema.object({
  name: schema
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(50, "Category name cannot exceed 50 characters")
    .optional(),
  slug: schema.slug("Slug must contain only lowercase alphanumeric characters and hyphens").optional(),
  isActive: schema.boolean().optional(),
})
  .minKeys(1, "At least one field (name, slug, or isActive) must be provided for update")
  .strict();

export const updateCategoryValidator = (req) => {
  const errors = [];
  updateCategoryBodySchema.validate(req.body || {}, "body", errors);
  if (errors.length > 0) {
    return { error: errors[0], errors };
  }
  return { error: null };
};

export default {
  createCategoryValidator,
  updateCategoryValidator,
};
