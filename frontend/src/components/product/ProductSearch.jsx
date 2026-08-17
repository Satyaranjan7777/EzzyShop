import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export const ProductSearch = ({
  initialValue = "",
  onSearchChange,
  placeholder = "Search for products...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue || "");
  const debounceTimerRef = useRef(null);

  // Sync internal state when external initialValue changes (e.g. from filter tags or URL navigation)
  useEffect(() => {
    setSearchTerm(initialValue || "");
  }, [initialValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear active timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim() === "") {
      // Immediate reset when input is emptied
      onSearchChange("");
    } else {
      // Debounce when typing search query
      debounceTimerRef.current = setTimeout(() => {
        onSearchChange(value.trim());
      }, 350);
    }
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchTerm("");
    onSearchChange("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl pl-10 pr-10 py-2.5 shadow-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProductSearch;
