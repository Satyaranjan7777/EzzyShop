import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { getPrimaryImage } from "../../utils/helpers";
import { useCartStore } from "../../store/cart.store";

export const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!item || !item.product) return null;

  const { product, quantity, itemTotal } = item;
  const imageUrl = getPrimaryImage(product.images);
  const maxStock = product.stock || 99;

  const handleIncrement = async () => {
    if (quantity >= maxStock) return;
    try {
      setIsUpdating(true);
      await updateQuantity(product._id, quantity + 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (quantity <= 1) {
      handleRemove();
      return;
    }
    try {
      setIsUpdating(true);
      await updateQuantity(product._id, quantity - 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUpdating(true);
      await removeItem(product._id);
    } finally {
      setIsUpdating(false);
    }
  };

  const effectivePrice = product.effectivePrice || (product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#ed1d24]/50 transition-all gap-4">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link
          to={`/products/${product._id}`}
          className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg bg-[#fbfbfb] overflow-hidden shrink-0 border border-slate-200 group flex items-center justify-center p-1"
        >
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
            }}
          />
        </Link>

        <div className="flex flex-col min-w-0 space-y-1">
          <Link
            to={`/products/${product._id}`}
            className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#ed1d24] transition-colors line-clamp-2"
          >
            {product.title}
          </Link>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-[#ed1d24]">
              {formatCurrency(effectivePrice)}
            </span>
            {product.discountPrice && product.discountPrice > 0 && product.price > product.discountPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {product.stock <= 5 && (
            <p className="text-[10px] font-bold text-amber-600">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </div>

      {/* Quantity Selector & Item Total & Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-300 rounded-lg bg-white p-0.5 shadow-xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isUpdating}
            className="w-7 h-7 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="w-8 text-center text-xs font-bold text-slate-800">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isUpdating || quantity >= maxStock}
            className="w-7 h-7 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Total Price */}
        <div className="text-right min-w-[70px]">
          <span className="text-sm sm:text-base font-extrabold text-slate-900">
            {formatCurrency(itemTotal || effectivePrice * quantity)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isUpdating}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          title="Remove from Cart"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
