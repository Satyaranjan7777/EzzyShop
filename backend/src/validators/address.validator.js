export const createAddressValidator = (req) => {
  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body || {};
  const errors = [];

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    errors.push("Full name is required and must be at least 2 characters long");
  }

  const phoneRegex = /^[0-9+\-\s]{7,15}$/;
  if (!phone || typeof phone !== "string" || !phoneRegex.test(phone.trim())) {
    errors.push("A valid phone number (7-15 digits) is required");
  }

  if (!addressLine || typeof addressLine !== "string" || addressLine.trim().length < 3) {
    errors.push("Address line is required and must be at least 3 characters long");
  }

  if (!city || typeof city !== "string" || city.trim().length < 2) {
    errors.push("City is required");
  }

  if (!state || typeof state !== "string" || state.trim().length < 2) {
    errors.push("State is required");
  }

  if (!pincode || typeof pincode !== "string" || pincode.trim().length < 3) {
    errors.push("Pincode is required");
  }

  if (country !== undefined && (typeof country !== "string" || country.trim().length === 0)) {
    errors.push("Country must be a valid string");
  }

  if (isDefault !== undefined && typeof isDefault !== "boolean") {
    errors.push("isDefault must be a boolean value");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};

export const updateAddressValidator = (req) => {
  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body || {};
  const errors = [];

  if (fullName !== undefined && (typeof fullName !== "string" || fullName.trim().length < 2)) {
    errors.push("Full name must be at least 2 characters long");
  }

  const phoneRegex = /^[0-9+\-\s]{7,15}$/;
  if (phone !== undefined && (typeof phone !== "string" || !phoneRegex.test(phone.trim()))) {
    errors.push("Please provide a valid phone number");
  }

  if (addressLine !== undefined && (typeof addressLine !== "string" || addressLine.trim().length < 3)) {
    errors.push("Address line must be at least 3 characters long");
  }

  if (city !== undefined && (typeof city !== "string" || city.trim().length < 2)) {
    errors.push("City must be a valid string");
  }

  if (state !== undefined && (typeof state !== "string" || state.trim().length < 2)) {
    errors.push("State must be a valid string");
  }

  if (pincode !== undefined && (typeof pincode !== "string" || pincode.trim().length < 3)) {
    errors.push("Pincode must be a valid string");
  }

  if (country !== undefined && (typeof country !== "string" || country.trim().length === 0)) {
    errors.push("Country must be a valid string");
  }

  if (isDefault !== undefined && typeof isDefault !== "boolean") {
    errors.push("isDefault must be a boolean value");
  }

  if (errors.length > 0) {
    return { error: errors[0], errors };
  }

  return { error: null };
};
