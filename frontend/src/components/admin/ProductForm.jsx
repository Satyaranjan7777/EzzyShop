import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { categoryService } from "../../services/category.service";
import Input from "../common/Input";
import Button from "../common/Button";

const productSchema = z.object({
  title: z
    .string()
    .min(2, "Product title must be at least 2 characters long")
    .max(200, "Product title cannot exceed 200 characters"),
  description: z
    .string()
    .min(5, "Product description must be at least 5 characters long"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a valid number" })
    .positive("Price must be greater than 0"),
  discountPrice: z.coerce
    .number({ invalid_type_error: "Discount price must be a number" })
    .nullable()
    .optional()
    .transform((val) => (isNaN(val) || val === 0 ? null : val)),
  category: z
    .string()
    .min(1, "Please select a product category"),
  stock: z.coerce
    .number({ invalid_type_error: "Stock must be a valid number" })
    .min(0, "Stock cannot be negative"),
  imagesInput: z.string().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.discountPrice !== null && data.discountPrice !== undefined) {
      return data.discountPrice < data.price;
    }
    return true;
  },
  {
    message: "Discount price must be less than regular price",
    path: ["discountPrice"],
  }
);

export const ProductForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Parse initial images to multiline string
  const initialImagesString = initialData?.images
    ? Array.isArray(initialData.images)
      ? initialData.images.join("\n")
      : initialData.images
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || "",
      discountPrice: initialData?.discountPrice || "",
      category:
        typeof initialData?.category === "object"
          ? initialData.category._id
          : initialData?.category || "",
      stock: initialData?.stock !== undefined ? initialData.stock : 10,
      imagesInput: initialImagesString,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoryService.getCategories({ all: true });
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories for product form", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleFormSubmit = (data) => {
    // Parse images newline or comma separated
    const imagesArray = data.imagesInput
      ? data.imagesInput
          .split(/[\n,]+/)
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
      : [];

    const payload = {
      title: data.title.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      discountPrice:
        data.discountPrice !== null && data.discountPrice !== undefined && data.discountPrice !== ""
          ? Number(data.discountPrice)
          : null,
      category: data.category,
      stock: Number(data.stock),
      images: imagesArray,
      isActive: data.isActive,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Title */}
      <Input
        label="Product Title"
        required
        placeholder="e.g. Wireless Noise-Cancelling Headphones"
        error={errors.title?.message}
        {...register("title")}
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Detailed product features, specifications, and warranty information..."
          className={`w-full bg-white border text-slate-900 text-sm rounded-lg p-3.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            errors.description
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-200 focus:border-[#ed1d24] focus:ring-[#ed1d24]/10"
          }`}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs font-medium text-rose-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Pricing & Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Regular Price (₹)"
          required
          type="number"
          step="0.01"
          placeholder="999"
          error={errors.price?.message}
          {...register("price")}
        />

        <Input
          label="Discount Price (₹) (Optional)"
          type="number"
          step="0.01"
          placeholder="799"
          error={errors.discountPrice?.message}
          {...register("discountPrice")}
        />

        {/* Category Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            className={`w-full bg-white border text-slate-900 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
              errors.category
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-[#ed1d24] focus:ring-[#ed1d24]/10"
            }`}
            {...register("category")}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} {!cat.isActive ? "(Inactive)" : ""}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs font-medium text-rose-600">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Stock & Active */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <Input
          label="Stock Inventory Quantity"
          required
          type="number"
          placeholder="50"
          error={errors.stock?.message}
          {...register("stock")}
        />

        <div className="sm:pt-5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#ed1d24] rounded border-slate-300 focus:ring-[#ed1d24] focus:ring-2"
              {...register("isActive")}
            />
            <span className="text-xs font-semibold text-slate-700">
              Active (Visible in Store)
            </span>
          </label>
        </div>
      </div>

      {/* Image URLs */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
          Direct Image URLs (One URL per line)
        </label>
        <textarea
          rows={3}
          placeholder="https://images.unsplash.com/photo-example-1&#10;https://images.unsplash.com/photo-example-2"
          className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-3.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-[#ed1d24] focus:ring-[#ed1d24]/10 font-mono text-xs"
          {...register("imagesInput")}
        />
        <p className="text-[11px] text-slate-500">
          Enter direct web image URLs. Provide one URL per line or separated by commas.
        </p>
      </div>

      {/* Actions */}
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
          {initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
