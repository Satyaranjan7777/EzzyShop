import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Input from "../common/Input";
import Button from "../common/Button";

const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .max(50, "Full name cannot exceed 50 characters"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{7,15}$/, "Valid phone number is required (7-15 digits)"),
  addressLine: z
    .string()
    .min(3, "Address line must be at least 3 characters long"),
  city: z.string().min(2, "City is required and must be at least 2 characters"),
  state: z.string().min(2, "State is required and must be at least 2 characters"),
  pincode: z
    .string()
    .min(3, "Pincode is required and must be at least 3 digits"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export const AddressForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      addressLine: initialData?.addressLine || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      pincode: initialData?.pincode || "",
      country: initialData?.country || "India",
      isDefault: initialData?.isDefault || false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          required
          placeholder="e.g. John Doe"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="Phone Number"
          required
          placeholder="e.g. 9876543210"
          error={errors.phone?.message}
          {...register("phone")}
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
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 focus:ring-2"
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
