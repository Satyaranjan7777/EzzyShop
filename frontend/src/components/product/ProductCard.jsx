import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Eye, Check, Heart, Star } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { calculateDiscountPercent, getPrimaryImage } from "../../utils/helpers";
import { useCartStore } from "../../store/cart.store";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

export const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success("Added to wishlist!");
    } else {
      toast.success("Removed from wishlist");
    }
  };

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 product-card-hover flex flex-col justify-between overflow-hidden">
      <div>
        {/* Product Image Frame */}
        <div className="relative w-full aspect-square bg-[#fbfbfb] overflow-hidden flex items-center justify-center p-3">
          <Link to={`/products/${_id}`} className="block w-full h-full">
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-106 transition-transform duration-300 ease-out"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
              }}
            />
          </Link>

          {/* Top Left Discount Badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#ed1d24] text-white rounded">
                {discountPercent}% OFF
              </span>
            )}
            {isOutOfStock ? (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded">
                Sold Out
              </span>
            ) : stock <= 5 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded">
                Only {stock} left
              </span>
            ) : null}
          </div>

          {/* Top Right Wishlist & Quick View */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-all ${
                isWishlisted
                  ? "bg-[#ed1d24] text-white"
                  : "bg-white text-slate-500 hover:text-[#ed1d24] border border-slate-200"
              }`}
              title="Add to Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            <Link
              to={`/products/${_id}`}
              className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-[#ed1d24] border border-slate-200 flex items-center justify-center shadow-xs transition-all opacity-0 group-hover:opacity-100"
              title="Quick View"
              aria-label="View product"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-3.5 sm:p-4 pb-2">
          {/* Category Tag */}
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate mb-1">
            {category?.name || "General"}
          </p>

          {/* Product Title */}
          <Link to={`/products/${_id}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#ed1d24] transition-colors line-clamp-2 leading-snug min-h-[2.4rem]">
              {title}
            </h3>
          </Link>

          {/* Star Rating Presentation */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">4.8</span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="p-3.5 sm:p-4 pt-1">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base sm:text-lg font-extrabold text-[#ed1d24]">
            {formatCurrency(displayPrice)}
          </span>
          {originalPrice && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={isOutOfStock || isAdding}
          onClick={handleAddToCart}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdded
              ? "bg-emerald-600 text-white"
              : isOutOfStock
              ? "bg-slate-200 text-slate-500"
              : "border border-[#ed1d24] text-[#ed1d24] hover:bg-[#ed1d24] hover:text-white"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Cart</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
