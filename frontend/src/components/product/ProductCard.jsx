import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Eye, Check } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { calculateDiscountPercent, getPrimaryImage } from "../../utils/helpers";
import { useCartStore } from "../../store/cart.store";
import useAuth from "../../hooks/useAuth";
import Button from "../common/Button";

export const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();

  if (!product) return null;

  const {
    _id,
    title,
    price,
    discountPrice,
    category,
    images,
    stock,
  } = product;

  const isOutOfStock = stock <= 0;
  const discountPercent = calculateDiscountPercent(price, discountPrice);
  const displayPrice = discountPrice && discountPrice > 0 ? discountPrice : price;
  const originalPrice = discountPrice && discountPrice > 0 ? price : null;
  const imageUrl = getPrimaryImage(images);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (isOutOfStock) return;

    try {
      setIsAdding(true);
      await addToCart(_id, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    } catch {
      // Handled in store toast
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-indigo-300 shadow-xs glow-card transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Product Image Frame */}
        <div className="relative w-full aspect-square bg-slate-100/70 overflow-hidden">
          <Link to={`/products/${_id}`} className="block w-full h-full">
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
              }}
            />
          </Link>

          {/* Floating Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none">
            {discountPercent > 0 ? (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white rounded-lg sm:rounded-xl shadow-sm">
                -{discountPercent}%
              </span>
            ) : (
              <span />
            )}

            {isOutOfStock ? (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-slate-900/85 text-white backdrop-blur-md rounded-lg sm:rounded-xl">
                Sold Out
              </span>
            ) : stock <= 5 ? (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-lg sm:rounded-xl shadow-xs">
                {stock} left
              </span>
            ) : null}
          </div>

          {/* Quick View Button overlay on hover (desktop only) */}
          <Link
            to={`/products/${_id}`}
            className="hidden sm:flex absolute bottom-3 right-3 p-2.5 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-indigo-600 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Meta */}
        <div className="p-3 sm:p-5">
          {/* Category Tag */}
          {category && (
            <span className="inline-block px-2 py-0.5 rounded-md sm:rounded-lg bg-indigo-50 text-indigo-700 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-2 truncate max-w-full">
              {category.name || "General"}
            </span>
          )}

          {/* Title */}
          <Link to={`/products/${_id}`}>
            <h3 className="text-xs sm:text-base font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 font-heading leading-snug min-h-[2rem] sm:min-h-[2.75rem]">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="p-3 sm:p-5 pt-0">
        <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mb-2.5 sm:mb-3.5">
          <span className="text-sm sm:text-xl font-black text-slate-900 font-heading">
            {formatCurrency(displayPrice)}
          </span>
          {originalPrice && (
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant={isAdded ? "success" : "primary"}
            size="sm"
            disabled={isOutOfStock}
            isLoading={isAdding}
            onClick={handleAddToCart}
            leftIcon={isAdded ? Check : ShoppingBag}
            className="flex-1 text-[11px] sm:text-xs py-2 sm:py-2.5 px-2 rounded-xl font-bold transition-all shadow-xs"
          >
            {isOutOfStock ? "Sold Out" : isAdded ? "Added" : "Add"}
          </Button>

          <Link
            to={`/products/${_id}`}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
            title="Full Specs"
            aria-label="View product details"
          >
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
