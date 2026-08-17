import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, ArrowRight, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import Button from "../common/Button";

export const CartSummary = ({
  summary = { totalItems: 0, subtotal: 0 },
  onCheckout,
  showCheckoutButton = true,
  isCheckingOut = false,
  checkoutButtonText = "Proceed to Checkout",
}) => {
  const subtotal = summary.subtotal || 0;
  const shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 50;
  const estimatedTotal = subtotal + shippingFee;
  const freeShippingThreshold = 1000;
  const amountNeededForFreeShipping = freeShippingThreshold - subtotal;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-lg font-black text-slate-900 font-heading">
          Order Summary
        </h3>
        <span className="text-xs font-bold text-slate-400">
          {summary.totalItems || 0} {summary.totalItems === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Free Shipping Progress Indicator */}
      {subtotal > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-indigo-900">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    You unlocked FREE Express Delivery!
                  </span>
                ) : (
                  <>
                    Add <strong className="text-indigo-700">{formatCurrency(amountNeededForFreeShipping)}</strong> for FREE Delivery
                  </>
                )}
              </span>
            </div>
            <span className="text-indigo-700">{progressPercent}%</span>
          </div>

          <div className="w-full bg-indigo-200/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                subtotal >= freeShippingThreshold ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Breakdown Rows */}
      <div className="space-y-3.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Items Subtotal</span>
          <span className="font-bold text-slate-900 font-heading">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Doorstep Delivery Charge</span>
          <span className="font-bold">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 uppercase text-xs font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                FREE
              </span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
          <div>
            <span className="text-base font-black text-slate-900 font-heading block">
              Estimated Total
            </span>
            <span className="text-[11px] text-slate-400 font-medium">All taxes & packaging included</span>
          </div>
          <span className="text-2xl font-black text-indigo-600 font-heading">
            {formatCurrency(estimatedTotal)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {showCheckoutButton && (
        <div className="pt-2">
          {onCheckout ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onCheckout}
              isLoading={isCheckingOut}
              rightIcon={ArrowRight}
              className="w-full shadow-lg shadow-indigo-600/25 py-4 font-bold rounded-2xl text-sm"
            >
              {checkoutButtonText}
            </Button>
          ) : (
            <Link to="/checkout" className="block">
              <Button
                type="button"
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                className="w-full shadow-lg shadow-indigo-600/25 py-4 font-bold rounded-2xl text-sm"
              >
                Proceed to Checkout
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Cash on Delivery • 100% Buyer Protection</span>
      </div>
    </div>
  );
};

export default CartSummary;
