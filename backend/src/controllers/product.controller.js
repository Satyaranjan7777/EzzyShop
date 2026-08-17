import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
 * @desc    Get all products with filtering, search, sorting & pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    sort,
    page = 1,
    limit = 10,
    minPrice,
    maxPrice,
    inStock,
  } = req.query;

  const query = { isActive: true };

  // Search filter
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  // Category filter (supports Category ObjectId or slug)
  if (category && category.trim() !== "") {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const foundCategory = await Category.findOne({ slug: category.trim().toLowerCase() });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        // If category slug not found, return empty data
        return new ApiResponse(
          200,
          "Products fetched successfully",
          [],
          { page: 1, limit: Number(limit), total: 0, totalPages: 0 }
        ).send(res);
      }
    }
  }

  // Price range filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      query.price.$lte = Number(maxPrice);
    }
  }

  // In-stock filter
  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }

  // Sorting
  let sortOption = { createdAt: -1 }; // default newest first
  if (sort) {
    switch (sort) {
      case "price":
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "-price":
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "title":
      case "title_asc":
        sortOption = { title: 1 };
        break;
      case "-title":
      case "title_desc":
        sortOption = { title: -1 };
        break;
      case "newest":
      case "-createdAt":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
      case "createdAt":
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  return new ApiResponse(
    200,
    "Products fetched successfully",
    products,
    {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    }
  ).send(res);
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name slug"
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return new ApiResponse(
    200,
    "Product fetched successfully",
    product
  ).send(res);
});

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    description,
    price,
    discountPrice,
    category,
    images,
    stock,
    isActive,
  } = req.body;

  // Validate category exists
  const foundCategory = await Category.findById(category);
  if (!foundCategory) {
    throw new ApiError(404, "Category not found");
  }

  const generatedSlug = slug
    ? generateSlug(slug)
    : `${generateSlug(title)}-${Date.now().toString().slice(-4)}`;

  const product = await Product.create({
    title: title.trim(),
    slug: generatedSlug,
    description: description.trim(),
    price: Number(price),
    discountPrice: discountPrice !== undefined && discountPrice !== null && discountPrice !== "" ? Number(discountPrice) : null,
    category,
    images: Array.isArray(images) ? images : [],
    stock: Number(stock) || 0,
    isActive: isActive !== undefined ? isActive : true,
  });

  const populatedProduct = await Product.findById(product._id).populate(
    "category",
    "name slug"
  );

  return new ApiResponse(
    201,
    "Product created successfully",
    populatedProduct
  ).send(res);
});

/**
 * @desc    Update a product
 * @route   PATCH /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    description,
    price,
    discountPrice,
    category,
    images,
    stock,
    isActive,
  } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (category) {
    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      throw new ApiError(404, "Category not found");
    }
    product.category = category;
  }

  if (title !== undefined) product.title = title.trim();
  if (slug !== undefined) product.slug = generateSlug(slug);
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (discountPrice !== undefined) {
    product.discountPrice = discountPrice !== null && discountPrice !== "" ? Number(discountPrice) : null;
  }
  if (images !== undefined) product.images = Array.isArray(images) ? images : [];
  if (stock !== undefined) product.stock = Number(stock);
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();

  const updatedProduct = await Product.findById(product._id).populate(
    "category",
    "name slug"
  );

  return new ApiResponse(
    200,
    "Product updated successfully",
    updatedProduct
  ).send(res);
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await Product.findByIdAndDelete(req.params.id);

  return new ApiResponse(
    200,
    "Product deleted successfully",
    null
  ).send(res);
});
