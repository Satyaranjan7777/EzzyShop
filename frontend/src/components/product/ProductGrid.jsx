import React from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import EmptyState from "../common/EmptyState";
import { PackageX } from "lucide-react";

export const ProductGrid = ({
  products = [],
  isLoading = false,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your search criteria or filter options to discover great products.",
  onResetFilters,
}) => {
  if (isLoading) {
    return <ProductSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageX}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? "Clear All Filters" : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
