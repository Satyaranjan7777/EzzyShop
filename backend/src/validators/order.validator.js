const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const createOrderValidator = (req) => {
  const { addressId, shippingAddress, paymentMethod } = req.body || {};
  const errors = [];

  if (!addressId && !shippingAddress) {
    errors.push("Either a valid addressId or a shippingAddress object must be provided");
  }

  if (addressId && !isValidObjectId(addressId)) {
    errors.push("Invalid addressId format");
  }

  if (shippingAddress) {
    const { fullName, phone, addressLine, city, state, pincode } = shippingAddress;
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      errors.push("Shipping address full name is required");
    }
    const phoneRegex = /^[0-9+\-\s]{7,15}$/;
    if (!phone || typeof phone !== "string" || !phoneRegex.test(phone.trim())) {
      errors.push("Valid shipping address phone number is required");
    }
    if (!addressLine || typeof addressLine !== "string" || addressLine.trim().length < 3) {
      errors.push("Shipping address line is required");
    }
    if (!city || typeof city !== "string" || city.trim().length < 2) {
      errors.push("Shipping address city is required");
    }
    if (!state || typeof state !== "string" || state.trim().length < 2) {
      errors.push("Shipping address state is required");
    }
    if (!pincode || typeof pincode !== "string" || pincode.trim().length < 3) {
      errors.push("Shipping address pincode is required");
    }
  }

  if (paymentMethod && paymentMethod !== "COD") {
    errors.push("Only COD (Cash on Delivery) is currently supported as payment method");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};

export const updateOrderStatusValidator = (req) => {
  const { orderStatus } = req.body || {};
  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
    return {
      error: `Invalid order status. Allowed values: ${allowedStatuses.join(", ")}`,
      errors: [`Order status must be one of: ${allowedStatuses.join(", ")}`],
    };
  }

  return { error: null };
};
