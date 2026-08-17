import React from "react";
import Skeleton from "react-loading-skeleton";

export const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            {/* Image Placeholder */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-4">
              <Skeleton height="100%" />
            </div>

            {/* Category */}
            <Skeleton width="40%" height={14} className="mb-2" />

            {/* Title */}
            <Skeleton count={2} height={16} className="mb-3" />
          </div>

          <div>
            {/* Price */}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
              <Skeleton width="50%" height={24} />
              <Skeleton width="30%" height={32} borderRadius={12} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
