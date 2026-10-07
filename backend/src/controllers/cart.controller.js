import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Format populated cart with calculated totals
 */
const formatCartResponse = (cart) => {
  let subtotal = 0;
  let totalItems = 0;

  const items = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || typeof product !== "object" || !product._id) {
      continue;
    }

    const unitPrice =
      product.discountPrice !== null &&
      product.discountPrice !== undefined &&
      product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;
    totalItems += item.quantity;

    items.push({
      product: {
        _id: product._id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        effectivePrice: unitPrice,
        images: product.images,
        stock: product.stock,
        isActive: product.isActive,
      },
      quantity: item.quantity,
      itemTotal,
    });
  }

  return {
    _id: cart._id,
    user: cart.user,
    items,
    summary: {
      totalItems,
      subtotal,
    },
    updatedAt: cart.updatedAt,
  };
};

/**
 * @desc    Get user cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "title slug price discountPrice images stock isActive",
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const formattedCart = formatCartResponse(cart);

  return new ApiResponse(
    200,
    "Cart fetched successfully",
    formattedCart
  ).send(res);
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/items
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const numQuantity = Number(quantity) || 1;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.isActive) {
    throw new ApiError(400, "This product is currently unavailable");
  }

  if (product.stock < numQuantity) {
    throw new ApiError(
      400,
      `Insufficient stock. Only ${product.stock} unit(s) available`
    );
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + numQuantity;
    if (newQuantity > product.stock) {
      throw new ApiError(
        400,
        `Cannot add more. You already have ${cart.items[existingItemIndex].quantity} in cart and total exceeds stock of ${product.stock}`
      );
    }
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity: numQuantity });
  }

  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "title slug price discountPrice images stock isActive",
  });

  const formattedCart = formatCartResponse(cart);

  return new ApiResponse(
    200,
    "Item added to cart successfully",
    formattedCart
  ).send(res);
});

/**
 * @desc    Update item quantity in cart
 * @route   PATCH /api/v1/cart/items/:productId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const numQuantity = Number(quantity);

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.isActive) {
    throw new ApiError(400, "This product is no longer active");
  }

  if (numQuantity > product.stock) {
    throw new ApiError(
      400,
      `Cannot set quantity to ${numQuantity}. Only ${product.stock} unit(s) in stock`
    );
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Product is not in your cart");
  }

  cart.items[itemIndex].quantity = numQuantity;
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "title slug price discountPrice images stock isActive",
  });

  const formattedCart = formatCartResponse(cart);

  return new ApiResponse(
    200,
    "Cart item updated successfully",
    formattedCart
  ).send(res);
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:productId
 * @access  Private
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const initialCount = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  if (cart.items.length === initialCount) {
    throw new ApiError(404, "Product was not found in your cart");
  }

  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "title slug price discountPrice images stock isActive",
  });

  const formattedCart = formatCartResponse(cart);

  return new ApiResponse(
    200,
    "Item removed from cart successfully",
    formattedCart
  ).send(res);
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  } else {
    cart.items = [];
    await cart.save();
  }

  const formattedCart = formatCartResponse(cart);

  return new ApiResponse(
    200,
    "Cart cleared successfully",
    formattedCart
  ).send(res);
});
