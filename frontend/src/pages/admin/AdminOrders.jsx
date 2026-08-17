import React, { useState, useEffect } from "react";
import { orderService } from "../../services/order.service";
import { getErrorMessage } from "../../utils/helpers";
import OrderTable from "../../components/admin/OrderTable";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const STATUS_TABS = [
  { label: "All Orders", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async (page = 1, status = "") => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10 };
      if (status) params.status = status;

      const res = await orderService.getAllOrders(params);
      setOrders(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load orders"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleStatusTabClick = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(res.message || `Order status updated to ${newStatus}`);
      await fetchOrders(currentPage, statusFilter);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update order status"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
          Customer Orders Management
        </h1>
        <p className="text-sm text-slate-500">
          Review placed orders, verify Cash on Delivery status, and update shipment progression
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleStatusTabClick(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      {isLoading && orders.length === 0 ? (
        <Loader text="Loading orders list..." />
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
          No orders found matching the selected status filter.
        </div>
      ) : (
        <div className="space-y-4">
          <OrderTable
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            isUpdating={isUpdating}
          />

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
