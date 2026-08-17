import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ArrowRight, Eye } from "lucide-react";
import { orderService } from "../../services/order.service";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate, getPrimaryImage } from "../../utils/helpers";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../utils/constants";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await orderService.getMyOrders({ page, limit: 10 });
      setOrders(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  if (isLoading && orders.length === 0) {
    return <Loader fullScreen text="Loading your order history..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-slate-200/80">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <Package className="w-3.5 h-3.5" />
          <span>Purchase History</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track real-time shipment progression and review your previous orders
        </p>
      </div>

      {/* Orders List or Empty State */}
      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Placed Yet"
          description="You haven't placed any orders yet. Browse our store catalog and order with zero prepayment Cash on Delivery."
          actionLabel="Explore Catalog"
          actionIcon={ArrowRight}
          onAction={() => navigate("/products")}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusCfg =
              ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.pending;
            const paymentCfg =
              PAYMENT_STATUS_CONFIG[order.payment?.status] || PAYMENT_STATUS_CONFIG.pending;

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-300"
              >
                {/* Order Top Bar */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider">
                        Order ID
                      </span>
                      <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider">
                        Date Placed
                      </span>
                      <span className="font-bold text-slate-700">
                        {formatDate(order.createdAt, false)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider">
                        Total Amount
                      </span>
                      <span className="font-black text-slate-900 font-heading">
                        {formatCurrency(order.pricing?.total || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusCfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>

                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${paymentCfg.badgeClass}`}
                    >
                      {order.payment?.method || "COD"} • {paymentCfg.label}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-5 sm:p-6 divide-y divide-slate-100">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={getPrimaryImage(item.image)}
                          alt={item.title}
                          className="w-14 h-14 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 truncate font-heading">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-black text-slate-900 font-heading shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer Actions */}
                <div className="p-4 sm:px-6 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Delivering to: <span className="font-bold text-slate-800">{order.shippingAddress?.fullName} ({order.shippingAddress?.city})</span>
                  </span>

                  <Link to={`/orders/${order._id}`}>
                    <Button variant="outline" size="sm" rightIcon={Eye} className="rounded-xl font-bold">
                      View Order Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}

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

export default Orders;
