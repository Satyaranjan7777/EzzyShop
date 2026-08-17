const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const createProductValidator = (req) => {
  const {
    title,
    description,
    price,
    discountPrice,
    category,
    images,
    stock,
    isActive,
  } = req.body || {};
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 2) {
    errors.push("Product title is required and must be at least 2 characters long");
  }

  if (!description || typeof description !== "string" || description.trim().length < 5) {
    errors.push("Product description is required and must be at least 5 characters long");
  }

  const numPrice = Number(price);
  if (price === undefined || isNaN(numPrice) || numPrice <= 0) {
    errors.push("Price is required and must be a positive number greater than 0");
  }

  if (discountPrice !== undefined && discountPrice !== null && discountPrice !== "") {
    const numDiscount = Number(discountPrice);
    if (isNaN(numDiscount) || numDiscount < 0) {
      errors.push("Discount price must be a valid non-negative number");
    } else if (!isNaN(numPrice) && numDiscount >= numPrice) {
      errors.push("Discount price must be less than the regular price");
    }
  }

  if (!category || !isValidObjectId(category)) {
    errors.push("A valid category ID is required");
  }

  if (images !== undefined) {
    if (!Array.isArray(images)) {
      errors.push("Images must be an array of image URL strings");
    } else if (images.some((img) => typeof img !== "string" || img.trim() === "")) {
      errors.push("Each image in images array must be a valid URL string");
    }
  }

  const numStock = Number(stock);
  if (stock === undefined || isNaN(numStock) || numStock < 0) {
    errors.push("Stock is required and must be a non-negative number");
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be a boolean value");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};

export const updateProductValidator = (req) => {
  const {
    title,
    description,
    price,
    discountPrice,
    category,
    images,
    stock,
    isActive,
  } = req.body || {};
  const errors = [];

  if (title !== undefined && (typeof title !== "string" || title.trim().length < 2)) {
    errors.push("Product title must be at least 2 characters long");
  }

  if (description !== undefined && (typeof description !== "string" || description.trim().length < 5)) {
    errors.push("Product description must be at least 5 characters long");
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push("Price must be a positive number greater than 0");
    }
  }

  if (discountPrice !== undefined && discountPrice !== null && discountPrice !== "") {
    const numDiscount = Number(discountPrice);
    if (isNaN(numDiscount) || numDiscount < 0) {
      errors.push("Discount price must be a valid non-negative number");
    }
  }

  if (category !== undefined && !isValidObjectId(category)) {
    errors.push("Invalid category ID format");
  }

  if (images !== undefined && !Array.isArray(images)) {
    errors.push("Images must be an array of image URL strings");
  }

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      errors.push("Stock must be a non-negative number");
    }
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be a boolean value");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};
