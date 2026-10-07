import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/activityLogger.js";

/**
 * Escape special regular expression characters
 */
const escapeRegex = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Generate slug helper
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  // If user is admin and explicitly requests all, return all; otherwise return active
  const filter = req.query.all === "true" ? {} : { isActive: true };

  const categories = await Category.find(filter).sort({ name: 1 });

  return new ApiResponse(
    200,
    "Categories fetched successfully",
    categories
  ).send(res);
});

/**
 * @desc    Get category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return new ApiResponse(
    200,
    "Category fetched successfully",
    category
  ).send(res);
});

/**
 * @desc    Create a category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, isActive } = req.body;

  const normalizedName = name.trim();
  const safeName = escapeRegex(normalizedName);
  const generatedSlug = slug ? generateSlug(slug) : generateSlug(normalizedName);

  // Check duplicate with escaped regex
  const existingCategory = await Category.findOne({
    $or: [{ name: { $regex: new RegExp(`^${safeName}$`, "i") } }, { slug: generatedSlug }],
  });

  if (existingCategory) {
    throw new ApiError(400, "Category with this name or slug already exists");
  }

  const category = await Category.create({
    name: normalizedName,
    slug: generatedSlug,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user ? req.user._id : null,
  });

  // Log admin activity for Master audit trail
  await logActivity(
    req.user,
    "CREATE_CATEGORY",
    "Category",
    category._id,
    category.name,
    { slug: category.slug },
    req
  );

  return new ApiResponse(
    201,
    "Category created successfully",
    category
  ).send(res);
});

/**
 * @desc    Update a category
 * @route   PATCH /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const normalizedName = name !== undefined ? name.trim() : null;
  const targetSlug = slug
    ? generateSlug(slug)
    : normalizedName && normalizedName !== category.name
    ? generateSlug(normalizedName)
    : null;

  const duplicateOr = [];
  if (normalizedName && normalizedName !== category.name) {
    const safeName = escapeRegex(normalizedName);
    duplicateOr.push({ name: { $regex: new RegExp(`^${safeName}$`, "i") } });
  }
  if (targetSlug && targetSlug !== category.slug) {
    duplicateOr.push({ slug: targetSlug });
  }

  if (duplicateOr.length > 0) {
    const existing = await Category.findOne({
      _id: { $ne: category._id },
      $or: duplicateOr,
    });

    if (existing) {
      if (normalizedName && existing.name.toLowerCase() === normalizedName.toLowerCase()) {
        throw new ApiError(400, "Category with this name already exists");
      }
      throw new ApiError(400, "Category with this slug already exists");
    }
  }

  if (normalizedName) {
    category.name = normalizedName;
  }

  if (targetSlug) {
    category.slug = targetSlug;
  }

  if (isActive !== undefined) {
    category.isActive = isActive;
  }

  await category.save();

  // Log admin activity for Master audit trail
  await logActivity(
    req.user,
    "UPDATE_CATEGORY",
    "Category",
    category._id,
    category.name,
    { updatedFields: Object.keys(req.body) },
    req
  );

  return new ApiResponse(
    200,
    "Category updated successfully",
    category
  ).send(res);
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if products exist in this category
  const productsCount = await Product.countDocuments({ category: category._id });
  if (productsCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category. It is linked to ${productsCount} product(s).`
    );
  }

  await Category.findByIdAndDelete(req.params.id);

  // Log admin activity for Master audit trail
  await logActivity(
    req.user,
    "DELETE_CATEGORY",
    "Category",
    category._id,
    category.name,
    {},
    req
  );

  return new ApiResponse(
    200,
    "Category deleted successfully",
    null
  ).send(res);
});
