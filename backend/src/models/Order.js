import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    title: {
      type: String,
      required: [true, "Product title snapshot is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price snapshot is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
  },
  {
    _id: false,
  }
);

const pricingSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
  },
  {
    _id: false,
  }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    pricing: {
      type: pricingSchema,
      required: [true, "Pricing breakdown is required"],
    },
    payment: {
      type: paymentSchema,
      default: () => ({ method: "COD", status: "pending" }),
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    cancellationReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [250, "Cancellation reason cannot exceed 250 characters"],
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not a valid cancellation actor",
      },
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
