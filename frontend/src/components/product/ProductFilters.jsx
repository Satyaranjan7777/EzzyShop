import React, { useState, useEffect } from "react";
import { RotateCcw, Check, SlidersHorizontal } from "lucide-react";
import { categoryService } from "../../services/category.service";
import { SORT_OPTIONS } from "../../utils/constants";

export const ProductFilters = ({
  selectedCategory = "",
  selectedSort = "newest",
  inStockOnly = false,
  onFilterChange,
  onResetFilters,
  className = "",
}) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoryService.getCategories();
        if (isMounted && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    selectedSort !== "newest" ||
    Boolean(inStockOnly);

  return (
    <div className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
            Filter Catalog
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition-colors focus:outline-none"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2">
        <label
          htmlFor="product-sort-select"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 block"
        >
          Sort Ordering
        </label>
        <select
          id="product-sort-select"
          value={selectedSort}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer shadow-xs"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Departments
        </label>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onFilterChange({ category: "" })}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
              !selectedCategory
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5" />}
          </button>

          {loadingCategories ? (
            <div className="p-3 text-xs text-slate-400">Loading categories...</div>
          ) : (
            categories.map((cat) => {
              const isSelected =
                selectedCategory === cat.slug || selectedCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => onFilterChange({ category: cat.slug || cat._id })}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Availability / In Stock Checkbox */}
      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 cursor-pointer select-none transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) =>
              onFilterChange({ inStock: e.target.checked ? "true" : "" })
            }
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 focus:ring-2"
          />
          <span className="text-xs font-bold text-slate-700">
            In-Stock Items Only
          </span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilters;
