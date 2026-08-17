import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @desc    Create a new order from user's cart
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, shippingAddress: customAddress, paymentMethod = "COD" } = req.body;

  // 1. Resolve shipping address
  let finalShippingAddress;

  if (addressId) {
    const foundAddress = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });
    if (!foundAddress) {
      throw new ApiError(404, "Selected shipping address not found");
    }
    finalShippingAddress = {
      fullName: foundAddress.fullName,
      phone: foundAddress.phone,
      addressLine: foundAddress.addressLine,
      city: foundAddress.city,
      state: foundAddress.state,
      pincode: foundAddress.pincode,
      country: foundAddress.country || "India",
    };
  } else if (customAddress) {
    finalShippingAddress = {
      fullName: customAddress.fullName.trim(),
      phone: customAddress.phone.trim(),
      addressLine: customAddress.addressLine.trim(),
      city: customAddress.city.trim(),
      state: customAddress.state.trim(),
      pincode: customAddress.pincode.trim(),
      country: customAddress.country ? customAddress.country.trim() : "India",
    };
  } else {
    throw new ApiError(400, "Shipping address is required");
  }

  // 2. Fetch User's Cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty. Cannot place an order.");
  }

  // 3. Fetch current product data from DB & Validate stock/active status
  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map();
  products.forEach((p) => productMap.set(p._id.toString(), p));

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = productMap.get(item.product.toString());

    if (!product) {
      throw new ApiError(
        400,
        `One of the products in your cart is no longer available`
      );
    }

    if (!product.isActive) {
      throw new ApiError(
        400,
        `Product "${product.title}" is currently unavailable`
      );
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}`
      );
    }

    // Backend price calculation (never trust frontend prices)
    const effectivePrice =
      product.discountPrice !== null &&
      product.discountPrice !== undefined &&
      product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    const itemTotal = effectivePrice * item.quantity;
    subtotal += itemTotal;

    // Snapshot of product details
    orderItems.push({
      product: product._id,
      title: product.title,
      price: effectivePrice,
      quantity: item.quantity,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
    });
  }

  // 4. Calculate final pricing
  const shippingFee = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shippingFee;

  // 5. Create Order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress: finalShippingAddress,
    pricing: {
      subtotal,
      shippingFee,
      total,
    },
    payment: {
      method: paymentMethod || "COD",
      status: "pending",
    },
    orderStatus: "pending",
  });

  // 6. Reduce stock for each purchased product
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // 7. Clear user's cart
  cart.items = [];
  await cart.save();

  return new ApiResponse(
    201,
    "Order placed successfully",
    order
  ).send(res);
});

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Order.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(total / limitNum);

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return new ApiResponse(
    200,
    "User orders fetched successfully",
    orders,
    {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    }
  ).send(res);
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "title slug images");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check authorization: User can only view own order unless admin
  const isOwner = order.user._id ? order.user._id.toString() === req.user._id.toString() : order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Access denied. You cannot view this order.");
  }

  return new ApiResponse(
    200,
    "Order details fetched successfully",
    order
  ).send(res);
});

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const query = {};
  if (status && status.trim() !== "") {
    query.orderStatus = status.trim();
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Order.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort(sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return new ApiResponse(
    200,
    "All orders fetched successfully",
    orders,
    {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    }
  ).send(res);
});

/**
 * @desc    Update order status (Admin only)
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const previousStatus = order.orderStatus;

  // If order was already cancelled, don't allow changing status
  if (previousStatus === "cancelled") {
    throw new ApiError(400, "Cannot change status of an already cancelled order");
  }

  // If order was already delivered, don't allow changing status back
  if (previousStatus === "delivered" && orderStatus !== "delivered") {
    throw new ApiError(400, "Cannot change status of an already delivered order");
  }

  order.orderStatus = orderStatus;

  // If order is cancelled, restore stock for each product
  if (orderStatus === "cancelled" && previousStatus !== "cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
    order.payment.status = "failed";
  }

  // If order is delivered and payment method is COD, mark payment as completed
  if (orderStatus === "delivered" && order.payment.method === "COD") {
    order.payment.status = "completed";
  }

  await order.save();

  return new ApiResponse(
    200,
    `Order status updated to '${orderStatus}' successfully`,
    order
  ).send(res);
});
