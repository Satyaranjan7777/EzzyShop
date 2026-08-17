import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  MapPin,
  ArrowLeft,
  Calendar,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { orderService } from "../../services/order.service";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate, getErrorMessage, getPrimaryImage } from "../../utils/helpers";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../utils/constants";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await orderService.getOrderById(id);
        if (isMounted && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Unable to load order details"));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <Loader fullScreen text="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ErrorState
          title="Order Not Found"
          message={error || "We could not find the requested order."}
          onRetry={() => window.location.reload()}
        />
        <div className="mt-6">
          <Link to="/orders">
            <Button variant="outline" leftIcon={ArrowLeft}>
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg =
    ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.pending;
  const paymentCfg =
    PAYMENT_STATUS_CONFIG[order.payment?.status] || PAYMENT_STATUS_CONFIG.pending;

  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200/80">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all orders
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusCfg.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {formatDate(order.createdAt, true)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
              Total Amount
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading">
              {formatCurrency(order.pricing?.total || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Progress Stepper */}
      {!isCancelled && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Delivery Progression
          </h3>

          <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative z-10 text-left sm:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                      isCompleted
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold capitalize ${
                        isCurrent
                          ? "text-indigo-600"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                        Current Status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Items snapshot & Delivery details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items Snapshot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-lg font-black text-slate-900 font-heading pb-4 border-b border-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Purchased Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={getPrimaryImage(item.image)}
                      alt={item.title}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1 font-heading">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-black text-slate-900 font-heading shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-heading pb-4 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Shipping Destination
            </h3>

            {order.shippingAddress ? (
              <div className="space-y-1.5 text-sm text-slate-700">
                <p className="font-extrabold text-slate-900 text-base font-heading">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {order.shippingAddress.addressLine}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} - <span className="font-bold text-slate-900">{order.shippingAddress.pincode}</span>,{" "}
                  {order.shippingAddress.country || "India"}
                </p>
                <p className="text-slate-500 pt-1 text-xs">
                  Phone: <span className="font-bold text-slate-800">{order.shippingAddress.phone}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Address not available</p>
            )}
          </div>
        </div>

        {/* Right Col: Payment & Financial Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Details
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-800">
                  {order.payment?.method || "Cash on Delivery"}
                </span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${paymentCfg.badgeClass}`}
              >
                {paymentCfg.label}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              Payment Breakdown
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(order.pricing?.subtotal || 0)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">
                  {order.pricing?.shippingFee === 0 ? (
                    <span className="text-emerald-600 uppercase text-xs font-bold">
                      FREE
                    </span>
                  ) : (
                    formatCurrency(order.pricing?.shippingFee || 0)
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-base font-black text-slate-900 font-heading">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-indigo-600 font-heading">
                  {formatCurrency(order.pricing?.total || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
