export const createCategoryValidator = (req) => {
  const { name, slug, isActive } = req.body || {};
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Category name is required and must be at least 2 characters long");
  }

  if (slug !== undefined && typeof slug !== "string") {
    errors.push("Slug must be a string");
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be a boolean value");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};

export const updateCategoryValidator = (req) => {
  const { name, slug, isActive } = req.body || {};
  const errors = [];

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.push("Category name must be at least 2 characters long");
  }

  if (slug !== undefined && typeof slug !== "string") {
    errors.push("Slug must be a string");
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be a boolean value");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};
