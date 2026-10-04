import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/activityLogger.js";

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

  // 5. Concurrency-Safe Stock Reservation & Order Creation
  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    session = null;
    useTransaction = false;
  }

  const decrementedItems = [];

  try {
    const sessionOpts = useTransaction ? { session } : {};

    // Atomically reserve inventory for each item using conditional updates
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
          isActive: true,
        },
        { $inc: { stock: -item.quantity } },
        { returnDocument: "after", ...sessionOpts }
      );

      if (!updatedProduct) {
        throw new ApiError(
          400,
          `Insufficient stock for "${item.title}". It may have just sold out.`
        );
      }

      decrementedItems.push(item);
    }

    // Create Order
    const orderDocs = await Order.create(
      [
        {
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
        },
      ],
      sessionOpts
    );

    const order = orderDocs[0];

    // Clear user's cart
    cart.items = [];
    await cart.save(sessionOpts);

    if (useTransaction && session) {
      await session.commitTransaction();
    }

    return new ApiResponse(
      201,
      "Order placed successfully",
      order
    ).send(res);
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    } else {
      // Standalone MongoDB without transactions: rollback decremented inventory
      for (const item of decrementedItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
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
 * Shared, concurrency-safe helper to execute order cancellation and inventory restoration
 * @param {Object} params
 * @param {string} params.orderId - The Order ID
 * @param {string} params.actor - 'user' | 'admin'
 * @param {string} [params.reason] - Optional cancellation reason
 * @param {string|mongoose.Types.ObjectId} [params.userId] - User ID for customer ownership enforcement
 * @returns {Promise<Object>} Updated Order document
 */
export const executeOrderCancellation = async ({
  orderId,
  actor,
  reason = null,
  userId = null,
}) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  // 1. Initial lookup to provide precise, user-friendly error codes
  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) {
    throw new ApiError(404, "Order not found");
  }

  // 2. Authorization check if customer
  if (actor === "user") {
    const isOwner =
      existingOrder.user._id
        ? existingOrder.user._id.toString() === userId.toString()
        : existingOrder.user.toString() === userId.toString();

    if (!isOwner) {
      throw new ApiError(403, "Access denied. You can only cancel your own orders.");
    }

    // Customer can only cancel pending or confirmed
    if (existingOrder.orderStatus === "cancelled") {
      throw new ApiError(400, "Order is already cancelled");
    }

    if (!["pending", "confirmed"].includes(existingOrder.orderStatus)) {
      throw new ApiError(
        400,
        "Order cannot be cancelled at its current status."
      );
    }
  } else if (actor === "admin") {
    if (existingOrder.orderStatus === "cancelled") {
      throw new ApiError(400, "Cannot change status of an already cancelled order");
    }
    if (existingOrder.orderStatus === "delivered") {
      throw new ApiError(400, "Cannot change status of an already delivered order");
    }
  }

  const trimmedReason =
    typeof reason === "string" && reason.trim() !== ""
      ? reason.trim().slice(0, 250)
      : null;

  const allowedPriorStatuses =
    actor === "user"
      ? ["pending", "confirmed"]
      : ["pending", "confirmed", "processing", "shipped"];

  // 3. Attempt MongoDB Transaction if supported by replica set
  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    // If standalone Mongo environment without replica set transactions
    session = null;
    useTransaction = false;
  }

  try {
    const sessionOpts = useTransaction ? { session } : {};

    // Atomically transition the order to cancelled matching only allowed prior statuses
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        orderStatus: { $in: allowedPriorStatuses },
        ...(actor === "user" && { user: userId }),
      },
      {
        $set: {
          orderStatus: "cancelled",
          cancellationReason: trimmedReason,
          cancelledAt: new Date(),
          cancelledBy: actor,
          "payment.status": "failed",
        },
      },
      {
        returnDocument: "after",
        ...sessionOpts,
      }
    )
      .populate("user", "name email")
      .populate("items.product", "title slug images");

    if (!updatedOrder) {
      throw new ApiError(
        400,
        "Order cannot be cancelled at its current status or was already updated."
      );
    }

    // Restore stock exactly once for every purchased item
    for (const item of updatedOrder.items) {
      const productId = item.product?._id || item.product;
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: item.quantity } },
        sessionOpts
      );
    }

    if (useTransaction && session) {
      await session.commitTransaction();
    }

    return updatedOrder;
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * @desc    Cancel order (Customer)
 * @route   PATCH /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body || {};

  const order = await executeOrderCancellation({
    orderId: req.params.id,
    actor: "user",
    reason,
    userId: req.user._id,
  });

  return new ApiResponse(
    200,
    "Order cancelled successfully",
    order
  ).send(res);
});

/**
 * @desc    Update order status (Admin only)
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, reason } = req.body;

  // Handle cancellation via shared concurrency-safe logic
  if (orderStatus === "cancelled") {
    const cancelledOrder = await executeOrderCancellation({
      orderId: req.params.id,
      actor: "admin",
      reason: reason || "Cancelled by administrator",
    });

    // Log admin activity for Master audit trail
    await logActivity(
      req.user,
      "CANCEL_ORDER",
      "Order",
      cancelledOrder._id,
      `#${cancelledOrder._id.toString().slice(-6).toUpperCase()}`,
      { reason: reason || "Cancelled by administrator" },
      req
    );

    return new ApiResponse(
      200,
      "Order status updated to 'cancelled' successfully",
      cancelledOrder
    ).send(res);
  }

  // Non-cancellation status transition logic
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

  // If order is delivered and payment method is COD, mark payment as completed
  if (orderStatus === "delivered" && order.payment.method === "COD") {
    order.payment.status = "completed";
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate("user", "name email")
    .populate("items.product", "title slug images");

  // Log admin activity for Master audit trail
  await logActivity(
    req.user,
    "UPDATE_ORDER_STATUS",
    "Order",
    populatedOrder._id,
    `#${populatedOrder._id.toString().slice(-6).toUpperCase()}`,
    { previousStatus, newStatus: orderStatus },
    req
  );

  return new ApiResponse(
    200,
    `Order status updated to '${orderStatus}' successfully`,
    populatedOrder
  ).send(res);
});
