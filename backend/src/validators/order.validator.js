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
    const phoneRegex = /^(?:(?:\+|0{0,2})91[\s\-]?)?(?:0[\s\-]?)?[6-9](?:[\s\-]?\d){9}$/;
    if (!phone || typeof phone !== "string" || !phoneRegex.test(phone.trim())) {
      errors.push("Valid 10-digit Indian shipping phone number is required (e.g. +91 9876543210 or 9876543210)");
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

export const cancelOrderValidator = (req) => {
  const { reason } = req.body || {};
  const errors = [];

  if (reason !== undefined && reason !== null) {
    if (typeof reason !== "string") {
      errors.push("Cancellation reason must be a string");
    } else if (reason.trim().length > 250) {
      errors.push("Cancellation reason cannot exceed 250 characters");
    }
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};
