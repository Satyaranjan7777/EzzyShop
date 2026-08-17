import Address from "../models/Address.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @desc    Get all user addresses
 * @route   GET /api/v1/addresses
 * @access  Private
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  return new ApiResponse(
    200,
    "Addresses fetched successfully",
    addresses
  ).send(res);
});

/**
 * @desc    Create a new address
 * @route   POST /api/v1/addresses
 * @access  Private
 */
export const createAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  const addressCount = await Address.countDocuments({ user: req.user._id });
  const makeDefault = isDefault || addressCount === 0;

  // If new address is default, unset existing default addresses
  if (makeDefault) {
    await Address.updateMany(
      { user: req.user._id, isDefault: true },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    user: req.user._id,
    fullName: fullName.trim(),
    phone: phone.trim(),
    addressLine: addressLine.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim(),
    country: country ? country.trim() : "India",
    isDefault: makeDefault,
  });

  return new ApiResponse(
    201,
    "Address created successfully",
    address
  ).send(res);
});

/**
 * @desc    Update an address
 * @route   PATCH /api/v1/addresses/:id
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address not found or unauthorized");
  }

  if (isDefault === true) {
    await Address.updateMany(
      { user: req.user._id, isDefault: true, _id: { $ne: address._id } },
      { isDefault: false }
    );
    address.isDefault = true;
  } else if (isDefault === false && address.isDefault) {
    // If unsetting default, make sure there's another address or allow
    address.isDefault = false;
  }

  if (fullName !== undefined) address.fullName = fullName.trim();
  if (phone !== undefined) address.phone = phone.trim();
  if (addressLine !== undefined) address.addressLine = addressLine.trim();
  if (city !== undefined) address.city = city.trim();
  if (state !== undefined) address.state = state.trim();
  if (pincode !== undefined) address.pincode = pincode.trim();
  if (country !== undefined) address.country = country.trim();

  await address.save();

  return new ApiResponse(
    200,
    "Address updated successfully",
    address
  ).send(res);
});

/**
 * @desc    Delete an address
 * @route   DELETE /api/v1/addresses/:id
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address not found or unauthorized");
  }

  const wasDefault = address.isDefault;
  await Address.findByIdAndDelete(req.params.id);

  // If deleted address was default, set the first available address as default
  if (wasDefault) {
    const nextAddress = await Address.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return new ApiResponse(
    200,
    "Address deleted successfully",
    null
  ).send(res);
});
