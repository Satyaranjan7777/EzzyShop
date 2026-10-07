import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "../../store/cart.store";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";

export const Cart = () => {
  const { items, summary, isLoading, fetchCart, clearCart } = useCartStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleConfirmClear = async () => {
    try {
      setIsClearing(true);
      await clearCart();
      setShowClearConfirm(false);
    } finally {
      setIsClearing(false);
    }
  };

  const hasItems = items && items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-[#ed1d24] flex items-center gap-1">
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Shopping Cart</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 font-heading">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isLoading
              ? "Updating your shopping cart..."
              : hasItems
              ? `You have ${summary.totalItems} item(s) in your cart`
              : "Your shopping cart is currently empty"}
          </p>
        </div>

        {hasItems && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        )}
      </div>

      {/* Cart Content */}
      {isLoading && (!items || items.length === 0) ? (
        <div className="py-16">
          <Loader text="Loading your shopping bag..." />
        </div>
      ) : !hasItems ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any items to your cart yet. Explore our top-tier catalog and enjoy zero-prepayment Cash on Delivery."
          actionLabel="Explore Products"
          actionIcon={ArrowRight}
          onAction={() => navigate("/products")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.product?._id || item._id} item={item} />
            ))}

            <div className="pt-4 flex items-center justify-between">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#ed1d24] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1 sticky top-24">
            <CartSummary
              summary={summary}
              showCheckoutButton={true}
            />
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleConfirmClear}
        isLoading={isClearing}
        title="Clear Shopping Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be reversed."
        confirmLabel="Yes, Clear Cart"
      />
    </div>
  );
};

export default Cart;
