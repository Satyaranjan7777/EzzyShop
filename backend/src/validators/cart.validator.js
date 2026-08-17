const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const addToCartValidator = (req) => {
  const { productId, quantity } = req.body || {};
  const errors = [];

  if (!productId || !isValidObjectId(productId)) {
    errors.push("A valid product ID is required");
  }

  if (quantity !== undefined) {
    const numQty = Number(quantity);
    if (!Number.isInteger(numQty) || numQty < 1) {
      errors.push("Quantity must be a positive integer of at least 1");
    }
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};

export const updateCartItemValidator = (req) => {
  const { quantity } = req.body || {};
  const { productId } = req.params || {};
  const errors = [];

  if (productId && !isValidObjectId(productId)) {
    errors.push("Invalid product ID in URL parameters");
  }

  const numQty = Number(quantity);
  if (quantity === undefined || !Number.isInteger(numQty) || numQty < 1) {
    errors.push("Quantity is required and must be a positive integer of at least 1");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};
