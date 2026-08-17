import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import ProductGrid from "../../components/product/ProductGrid";
import ProductSearch from "../../components/product/ProductSearch";
import ProductFilters from "../../components/product/ProductFilters";
import Pagination from "../../components/common/Pagination";
import ErrorState from "../../components/common/ErrorState";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { DEFAULT_PAGE_LIMIT } from "../../utils/constants";
import { X, Sparkles, SlidersHorizontal } from "lucide-react";

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, pagination, isLoading, error, fetchProducts } = useProducts();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Parse filters from URL
  const currentFilters = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      sort: searchParams.get("sort") || "newest",
      page: parseInt(searchParams.get("page"), 10) || 1,
      limit: parseInt(searchParams.get("limit"), 10) || DEFAULT_PAGE_LIMIT,
      inStock: searchParams.get("inStock") || "",
    };
  }, [searchParams]);

  // Fetch products whenever URL search params change
  useEffect(() => {
    const params = {
      page: currentFilters.page,
      limit: currentFilters.limit,
      sort: currentFilters.sort,
    };

    if (currentFilters.search) params.search = currentFilters.search;
    if (currentFilters.category) params.category = currentFilters.category;
    if (currentFilters.inStock === "true") params.inStock = "true";

    fetchProducts(params);
  }, [currentFilters, fetchProducts]);

  // Helper to update URL search params
  const updateUrlParams = (newParams, resetPage = false) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        });

        if (resetPage) {
          next.set("page", "1");
        }

        return next;
      },
      { replace: true }
    );
  };

  const handleSearchChange = (searchValue) => {
    updateUrlParams({ search: searchValue }, true);
  };

  const handleFilterChange = (filterUpdates) => {
    updateUrlParams(filterUpdates, true);
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams({ page: "1", sort: "newest" }));
  };

  const activeFiltersCount = [
    Boolean(currentFilters.search),
    Boolean(currentFilters.category),
    currentFilters.sort !== "newest",
    currentFilters.inStock === "true",
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
            <span>Store Catalog</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black font-heading leading-tight">
            Explore All Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Discover thousands of handpicked goods with doorstep Cash on Delivery guarantee.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
          <span className="text-slate-300">Total:</span>
          <span className="text-white font-bold">{pagination.total || 0} Items</span>
        </div>
      </div>

      {/* Mobile Search & Filter Action Bar */}
      <div className="lg:hidden flex items-center gap-2.5">
        <div className="flex-1">
          <ProductSearch
            initialValue={currentFilters.search}
            onSearchChange={handleSearchChange}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 shrink-0 cursor-pointer"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid: Sidebar Filters + Products Listing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Desktop Left Filters Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-5 sticky top-24">
          <ProductSearch
            initialValue={currentFilters.search}
            onSearchChange={handleSearchChange}
          />

          <ProductFilters
            selectedCategory={currentFilters.category}
            selectedSort={currentFilters.sort}
            inStockOnly={currentFilters.inStock === "true"}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Products Catalog */}
        <div className="lg:col-span-3 space-y-5 sm:space-y-6">
          {/* Active Filters Pill Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs">
              <span className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider pl-1">
                Active:
              </span>

              {currentFilters.search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-[11px] sm:text-xs">
                  <span>Search: "{currentFilters.search}"</span>
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="hover:text-indigo-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {currentFilters.category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-[11px] sm:text-xs">
                  <span>Category: {currentFilters.category}</span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ category: "" })}
                    className="hover:text-purple-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {currentFilters.inStock === "true" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px] sm:text-xs">
                  <span>In Stock Only</span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ inStock: "" })}
                    className="hover:text-emerald-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:underline ml-auto pr-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Error / Grid Display */}
          {error ? (
            <ErrorState
              title="Unable to load products"
              message={error}
              onRetry={() => fetchProducts(currentFilters)}
            />
          ) : (
            <>
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onResetFilters={handleResetFilters}
              />

              {/* Pagination */}
              {!isLoading && pagination.totalPages > 1 && (
                <div className="pt-2 sm:pt-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal Sheet */}
      <Modal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filters & Sorting"
        description="Refine products by category, sort order, and stock availability"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <ProductFilters
            selectedCategory={currentFilters.category}
            selectedSort={currentFilters.sort}
            inStockOnly={currentFilters.inStock === "true"}
            onFilterChange={(updates) => {
              handleFilterChange(updates);
              setIsMobileFilterOpen(false);
            }}
            onResetFilters={() => {
              handleResetFilters();
              setIsMobileFilterOpen(false);
            }}
            className="border-0 shadow-none p-0"
          />

          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              View {pagination.total || 0} Products
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
