import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Input from "../common/Input";
import Button from "../common/Button";

const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(100, "Category name cannot exceed 100 characters"),
  slug: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CategoryForm = ({
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
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Category Name"
        required
        placeholder="e.g. Electronics"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Slug (Optional)"
        placeholder="e.g. electronics (auto-generated if left blank)"
        helperText="Leave blank to automatically generate from name"
        error={errors.slug?.message}
        {...register("slug")}
      />

      <div className="flex items-center pt-2">
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
          {initialData ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
