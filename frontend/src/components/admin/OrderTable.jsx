import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit3, Check, Loader2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/helpers";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../utils/constants";

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const OrderTable = ({
  orders = [],
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleStartEdit = (order) => {
    setEditingOrderId(order._id);
    setSelectedStatus(order.orderStatus);
  };

  const handleSaveStatus = async (orderId) => {
    if (!selectedStatus) return;
    await onUpdateStatus(orderId, selectedStatus);
    setEditingOrderId(null);
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setSelectedStatus("");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 sm:px-6">Order ID</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Items</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {orders.map((order) => {
              const statusCfg =
                ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.pending;
              const paymentCfg =
                PAYMENT_STATUS_CONFIG[order.payment?.status] || PAYMENT_STATUS_CONFIG.pending;
              const isEditingThis = editingOrderId === order._id;

              return (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Order ID */}
                  <td className="py-4 px-4 sm:px-6 font-mono text-xs font-bold text-[#ed1d24]">
                    <Link
                      to={`/orders/${order._id}`}
                      className="hover:underline"
                      title={order._id}
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">
                        {order.user?.name || order.shippingAddress?.fullName || "Guest Customer"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {order.user?.email || order.shippingAddress?.phone || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Items count & summary */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-medium text-slate-800 text-xs">
                        {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {order.items?.map((i) => i.title).join(", ")}
                      </span>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {formatCurrency(order.pricing?.total || 0)}
                  </td>

                  {/* Payment */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-700 uppercase">
                        {order.payment?.method || "COD"}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit ${paymentCfg.badgeClass}`}
                      >
                        {paymentCfg.label}
                      </span>
                    </div>
                  </td>

                  {/* Order Status */}
                  <td className="py-4 px-4">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {ALLOWED_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st.charAt(0).toUpperCase() + st.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleSaveStatus(order._id)}
                          disabled={isUpdating}
                          className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                          title="Save Status"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                        />
                        {statusCfg.label}
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(order.createdAt, false)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isEditingThis && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(order)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Change Order Status"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <Link
                        to={`/orders/${order._id}`}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
