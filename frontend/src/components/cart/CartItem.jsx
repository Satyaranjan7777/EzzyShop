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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all gap-4">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link
          to={`/products/${product._id}`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100/80 overflow-hidden shrink-0 border border-slate-100 group"
        >
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
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
            className="text-sm sm:text-base font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 font-heading"
          >
            {product.title}
          </Link>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-900 font-heading">
              {formatCurrency(effectivePrice)}
            </span>
            {product.discountPrice && product.discountPrice > 0 && product.price > product.discountPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {product.stock <= 5 && (
            <p className="text-[11px] font-bold text-amber-600">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </div>

      {/* Quantity Selector & Item Total & Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1 shadow-xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isUpdating}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-600 hover:text-slate-900 shadow-xs border border-slate-200/60 disabled:opacity-50 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-10 text-center text-xs font-black text-slate-800">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isUpdating || quantity >= maxStock}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-600 hover:text-slate-900 shadow-xs border border-slate-200/60 disabled:opacity-50 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Price */}
        <div className="text-right min-w-[80px]">
          <span className="text-base font-black text-slate-900 font-heading">
            {formatCurrency(itemTotal || effectivePrice * quantity)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isUpdating}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
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
