import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Input from "../common/Input";
import Button from "../common/Button";

// Validates exactly 10-digit Indian mobile number starting with 6, 7, 8, or 9
const INDIAN_10_DIGIT_PHONE_REGEX = /^[6-9]\d{9}$/;

const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .max(50, "Full name cannot exceed 50 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .length(10, "Mobile number must be exactly 10 digits")
    .regex(
      INDIAN_10_DIGIT_PHONE_REGEX,
      "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9"
    ),
  addressLine: z
    .string()
    .min(3, "Address line must be at least 3 characters long"),
  city: z.string().min(2, "City is required and must be at least 2 characters"),
  state: z.string().min(2, "State is required and must be at least 2 characters"),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export const AddressForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Extract 10 digits if initial phone has +91 or spaces
  const cleanInitialPhone = initialData?.phone
    ? initialData.phone.replace(/\D/g, "").slice(-10)
    : "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phone: cleanInitialPhone,
      addressLine: initialData?.addressLine || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      pincode: initialData?.pincode || "",
      country: initialData?.country || "India",
      isDefault: initialData?.isDefault || false,
    },
  });

  const handleFormSubmit = (data) => {
    // Clean and normalize phone with +91 prefix
    const cleanDigits = data.phone.replace(/\D/g, "").slice(-10);
    const formattedData = {
      ...data,
      phone: `+91 ${cleanDigits}`,
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          required
          placeholder="e.g. John Doe"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="Mobile Number"
          required
          leftAddon={
            <span className="flex items-center gap-1">
              <span>🇮🇳</span>
              <span>+91</span>
            </span>
          }
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          helperText="10-digit Indian mobile number"
          error={errors.phone?.message}
          {...register("phone", {
            onChange: (e) => {
              // Restrict to digits only and maximum 10 characters
              const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 10);
              setValue("phone", onlyNums, { shouldValidate: true });
            },
          })}
        />
      </div>

      <Input
        label="Street Address / Flat / Landmark"
        required
        placeholder="e.g. Flat 402, Sunshine Apartments, Green Valley Rd"
        error={errors.addressLine?.message}
        {...register("addressLine")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City"
          required
          placeholder="e.g. Mumbai"
          error={errors.city?.message}
          {...register("city")}
        />

        <Input
          label="State"
          required
          placeholder="e.g. Maharashtra"
          error={errors.state?.message}
          {...register("state")}
        />

        <Input
          label="Pincode / ZIP"
          required
          placeholder="e.g. 400001"
          error={errors.pincode?.message}
          {...register("pincode")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Country"
          placeholder="India"
          error={errors.country?.message}
          {...register("country")}
        />

        <div className="flex items-center sm:pt-6">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#ed1d24] rounded border-slate-300 focus:ring-[#ed1d24] focus:ring-2"
              {...register("isDefault")}
            />
            <span className="text-xs font-semibold text-slate-700">
              Set as Default Shipping Address
            </span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {initialData ? "Update Address" : "Save Address"}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
