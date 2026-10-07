import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import ActivityLog from "../models/ActivityLog.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import seedMaster from "../seeds/seedMaster.js";

/**
 * Generate JWT Token Helper
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/**
 * @desc    Master Account Login
 * @route   POST /api/v1/master/login
 * @access  Public (Restricted to master role credentials)
 */
export const masterLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select password
  let user = await User.findOne({ email: normalizedEmail }).select("+password");

  // Auto-provision if master account is not yet seeded in MongoDB
  if (!user && normalizedEmail === "satyaranjan@gmail.com") {
    try {
      await seedMaster();
      user = await User.findOne({ email: normalizedEmail }).select("+password");
    } catch (seedErr) {
      console.warn("Auto-seed master on login failed:", seedErr?.message);
    }
  }

  if (!user) {
    throw new ApiError(401, "Invalid master credentials. Master account not found.");
  }

  // Strict role check: Only role === "master" can log in through the master route
  if (user.role !== "master") {
    throw new ApiError(403, "Access denied. Master privileges required.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Master account is deactivated. Contact system administrator.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid master credentials. Password does not match.");
  }

  const token = generateToken(user._id, user.role);

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  return new ApiResponse(
    200,
    "Master authentication successful",
    { user: userData, token }
  ).send(res);
});

/**
 * Escape special regular expression characters to prevent ReDoS and Regex Injection
 */
const escapeRegex = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * @desc    Get all admin users
 * @route   GET /api/v1/master/admins
 * @access  Private (Master Only)
 */
export const getAdmins = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const query = { role: "admin" };

  if (search && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(safeSearch, "i");
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const admins = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 });

  return new ApiResponse(
    200,
    "Admins fetched successfully",
    { admins, count: admins.length }
  ).send(res);
});

/**
 * @desc    Get specific admin details
 * @route   GET /api/v1/master/admins/:id
 * @access  Private (Master Only)
 */
export const getAdminById = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ _id: req.params.id, role: "admin" }).select("-password");

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return new ApiResponse(
    200,
    "Admin details fetched successfully",
    { admin }
  ).send(res);
});

/**
 * @desc    Create a new admin user
 * @route   POST /api/v1/master/admins
 * @access  Private (Master Only)
 */
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if a user with this email already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(400, "A user or admin with this email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create admin account
  const newAdmin = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  const adminData = {
    _id: newAdmin._id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role,
    isActive: newAdmin.isActive,
    createdAt: newAdmin.createdAt,
  };

  return new ApiResponse(
    201,
    "Admin account created successfully",
    { admin: adminData }
  ).send(res);
});

/**
 * @desc    Update admin user (status, name, password, email)
 * @route   PUT /api/v1/master/admins/:id
 * @access  Private (Master Only)
 */
export const updateAdmin = asyncHandler(async (req, res) => {
  const { name, email, isActive, password } = req.body;

  const admin = await User.findOne({ _id: req.params.id, role: "admin" });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  if (email && email.toLowerCase().trim() !== admin.email) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ApiError(400, "Another user is already registered with this email address");
    }
    admin.email = normalizedEmail;
  }

  if (name !== undefined) {
    admin.name = name.trim();
  }

  if (isActive !== undefined) {
    admin.isActive = Boolean(isActive);
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
  }

  await admin.save();

  const adminData = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    updatedAt: admin.updatedAt,
    createdAt: admin.createdAt,
  };

  return new ApiResponse(
    200,
    "Admin account updated successfully",
    { admin: adminData }
  ).send(res);
});

/**
 * @desc    Delete an admin user
 * @route   DELETE /api/v1/master/admins/:id
 * @access  Private (Master Only)
 */
export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOneAndDelete({ _id: req.params.id, role: "admin" });

  if (!admin) {
    throw new ApiError(404, "Admin not found or cannot delete non-admin users via this endpoint");
  }

  return new ApiResponse(
    200,
    "Admin deleted successfully",
    { deletedAdminId: req.params.id }
  ).send(res);
});

/**
 * @desc    Get master platform overview metrics
 * @route   GET /api/v1/master/overview
 * @access  Private (Master Only)
 */
export const getMasterOverview = asyncHandler(async (req, res) => {
  const [
    totalAdmins,
    activeAdmins,
    totalCustomers,
    totalProducts,
    totalOrders,
    revenueAgg,
    recentActivities,
  ] = await Promise.all([
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "admin", isActive: true }),
    User.countDocuments({ role: "user" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { "payment.status": "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$pricing.total" } } },
    ]),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  return new ApiResponse(200, "Master platform overview fetched successfully", {
    stats: {
      admins: {
        total: totalAdmins,
        active: activeAdmins,
        inactive: totalAdmins - activeAdmins,
      },
      customers: totalCustomers,
      products: totalProducts,
      orders: totalOrders,
      revenue: totalRevenue,
    },
    recentActivities,
  }).send(res);
});

/**
 * @desc    Get admin activity audit logs
 * @route   GET /api/v1/master/activities
 * @access  Private (Master Only)
 */
export const getAdminActivities = asyncHandler(async (req, res) => {
  const { adminId, entityType, action, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
    query.admin = adminId;
  }

  if (entityType && entityType.trim()) {
    query.entityType = entityType.trim();
  }

  if (action && action.trim()) {
    query.action = action.trim();
  }

  if (search && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(safeSearch, "i");
    query.$or = [
      { adminName: searchRegex },
      { adminEmail: searchRegex },
      { entityTitle: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const total = await ActivityLog.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  const activities = await ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return new ApiResponse(200, "Admin activities fetched successfully", {
    activities,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  }).send(res);
});

/**
 * @desc    Get activities of a specific administrator
 * @route   GET /api/v1/master/admins/:id/activities
 * @access  Private (Master Only)
 */
export const getSingleAdminActivities = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ _id: req.params.id, role: "admin" });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const adminObjectId = new mongoose.Types.ObjectId(req.params.id);

  // Parallel query: activities stream, action aggregates, and active created products & categories
  const [
    activities,
    actionAggregates,
    productsCreatedCount,
    categoriesCreatedCount,
  ] = await Promise.all([
    ActivityLog.find({ admin: req.params.id }).sort({ createdAt: -1 }).limit(100),
    ActivityLog.aggregate([
      { $match: { admin: adminObjectId } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
    ]),
    Product.countDocuments({ createdBy: adminObjectId }),
    Category.countDocuments({ createdBy: adminObjectId }),
  ]);

  // Map action counts
  const actionCounts = {};
  actionAggregates.forEach((item) => {
    actionCounts[item._id] = item.count;
  });

  const productsCreatedLogs = actionCounts["CREATE_PRODUCT"] || 0;
  const productsUpdatedLogs = actionCounts["UPDATE_PRODUCT"] || 0;
  const productsDeletedLogs = actionCounts["DELETE_PRODUCT"] || 0;

  const categoriesCreatedLogs = actionCounts["CREATE_CATEGORY"] || 0;
  const categoriesUpdatedLogs = actionCounts["UPDATE_CATEGORY"] || 0;
  const categoriesDeletedLogs = actionCounts["DELETE_CATEGORY"] || 0;

  const ordersUpdatedLogs = actionCounts["UPDATE_ORDER_STATUS"] || 0;
  const ordersCancelledLogs = actionCounts["CANCEL_ORDER"] || 0;

  const loginsCount = actionCounts["ADMIN_LOGIN"] || 0;

  const stats = {
    products: {
      created: productsCreatedLogs || productsCreatedCount,
      updated: productsUpdatedLogs,
      deleted: productsDeletedLogs,
      totalActions: productsCreatedLogs + productsUpdatedLogs + productsDeletedLogs,
      activeInCatalog: productsCreatedCount,
    },
    categories: {
      created: categoriesCreatedLogs || categoriesCreatedCount,
      updated: categoriesUpdatedLogs,
      deleted: categoriesDeletedLogs,
      totalActions: categoriesCreatedLogs + categoriesUpdatedLogs + categoriesDeletedLogs,
      activeInCatalog: categoriesCreatedCount,
    },
    orders: {
      statusUpdated: ordersUpdatedLogs,
      cancelled: ordersCancelledLogs,
      totalActions: ordersUpdatedLogs + ordersCancelledLogs,
    },
    logins: {
      total: loginsCount,
    },
    totalActivities: activities.length,
    lastActiveAt: activities.length > 0 ? activities[0].createdAt : null,
  };

  return new ApiResponse(200, `Details and activities for ${admin.name} fetched successfully`, {
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    },
    stats,
    activities,
    count: activities.length,
  }).send(res);
});
