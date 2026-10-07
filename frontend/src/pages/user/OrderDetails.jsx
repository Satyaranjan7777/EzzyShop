import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  MapPin,
  ArrowLeft,
  Calendar,
  Banknote,
  CheckCircle2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
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
import Modal from "../../components/common/Modal";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonOption, setCancelReasonOption] = useState("Changed my mind");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleOpenCancelModal = () => {
    setCancelReasonOption("Changed my mind");
    setCustomCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (!isCancelling) {
      setIsCancelModalOpen(false);
    }
  };

  const handleConfirmCancel = async () => {
    const finalReason =
      cancelReasonOption === "Other"
        ? customCancelReason.trim()
        : cancelReasonOption;

    try {
      setIsCancelling(true);
      const res = await orderService.cancelOrder(order._id, finalReason);
      toast.success(res.message || "Order cancelled successfully");

      if (res.data) {
        setOrder(res.data);
      } else {
        setOrder((prev) => ({
          ...prev,
          orderStatus: "cancelled",
          cancellationReason: finalReason || null,
          cancelledAt: new Date().toISOString(),
          cancelledBy: "user",
          payment: { ...prev.payment, status: "failed" },
        }));
      }
      setIsCancelModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to cancel order"));
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#ed1d24] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
        </Link>
        <div className="py-20">
          <Loader text="Loading order details..." />
        </div>
      </div>
    );
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
  const canCancel = ["pending", "confirmed"].includes(order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200/80">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed1d24] transition-colors"
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

          <div className="flex flex-wrap items-center gap-4">
            {canCancel && (
              <Button
                variant="dangerOutline"
                size="sm"
                leftIcon={Ban}
                onClick={handleOpenCancelModal}
                className="font-bold rounded-lg"
              >
                Cancel Order
              </Button>
            )}

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                Total Amount
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#ed1d24] font-heading">
                {formatCurrency(order.pricing?.total || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancelled Order Banner OR Active Delivery Stepper */}
      {isCancelled ? (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <Ban className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-black text-rose-900 font-heading">
                  This Order Has Been Cancelled
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                  Cancelled {order.cancelledBy === "admin" ? "by Store Admin" : "by Customer"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-700">
                This order was marked as cancelled on{" "}
                <span className="font-bold">
                  {formatDate(order.cancelledAt || order.updatedAt, true)}
                </span>
                . Product inventory has been safely restored. No payment was captured for this Cash on Delivery order.
              </p>
            </div>
          </div>

          {order.cancellationReason && (
            <div className="pt-3 border-t border-rose-200/60 flex items-start gap-2 text-xs text-rose-800">
              <span className="font-bold shrink-0">Reason for cancellation:</span>
              <span className="italic font-medium">"{order.cancellationReason}"</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
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
                        ? "bg-[#ed1d24] text-white shadow-md shadow-[#ed1d24]/20"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold capitalize ${
                        isCurrent
                          ? "text-[#ed1d24]"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#ed1d24] uppercase tracking-wider block">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Items snapshot & Delivery details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items Snapshot */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 font-heading pb-3 border-b border-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#ed1d24]" />
              Purchased Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={getPrimaryImage(item.image)}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-contain bg-[#fbfbfb] shrink-0 border border-slate-200 p-1"
                    />
                    <div className="min-w-0 space-y-0.5">
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
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-black text-slate-900 font-heading pb-3 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#ed1d24]" />
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
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Details
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-[#ed1d24]" />
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
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
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
                <span className="text-2xl font-black text-[#ed1d24] font-heading">
                  {formatCurrency(order.pricing?.total || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        title="Cancel Order Confirmation"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmCancel();
          }}
          className="space-y-4 pt-1"
        >
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Upon cancellation, reserved item quantities will be returned to inventory and delivery processing will be stopped immediately.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason for cancellation <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <select
              value={cancelReasonOption}
              onChange={(e) => setCancelReasonOption(e.target.value)}
              disabled={isCancelling}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#ed1d24] focus:ring-2 focus:ring-[#ed1d24]/10 transition-all font-medium cursor-pointer"
            >
              <option value="Changed my mind">Changed my mind</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found a better price">Found a better price</option>
              <option value="Delivery taking too long">Delivery taking too long</option>
              <option value="Other">Other (specify custom reason)</option>
            </select>
          </div>

          {cancelReasonOption === "Other" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-600">
                Please specify reason <span className="text-slate-400 font-normal">(max 250 characters)</span>
              </label>
              <textarea
                value={customCancelReason}
                onChange={(e) => setCustomCancelReason(e.target.value.slice(0, 250))}
                disabled={isCancelling}
                rows={3}
                placeholder="Tell us why you are cancelling..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-3 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#ed1d24] focus:ring-2 focus:ring-[#ed1d24]/10 transition-all resize-none"
              />
              <div className="text-right text-[10px] text-slate-400 font-semibold">
                {customCancelReason.length}/250
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseCancelModal}
              disabled={isCancelling}
              className="rounded-lg font-bold text-slate-600 hover:text-slate-900"
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              disabled={isCancelling}
              leftIcon={Ban}
              className="rounded-lg font-bold shadow-md shadow-rose-600/20"
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetails;
