import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Package,
  ArrowRight,
  Volume2,
  VolumeX,
  Ban,
  ShoppingBag,
} from "lucide-react";
import { useAdminNotificationStore } from "../../store/adminNotification.store";
import { formatDate } from "../../utils/helpers";

export const AdminNotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    soundEnabled,
    toggleSound,
  } = useAdminNotificationStore();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id || notification.orderId);
    setIsOpen(false);
    navigate(`/orders/${notification.orderId}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-700 hover:text-[#ed1d24] bg-slate-100/70 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-200 focus:outline-none group cursor-pointer"
        aria-label="Order Notifications"
        title="Store Alerts & Live Orders"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#ed1d24] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md shadow-[#ed1d24]/30 animate-pulse ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden divide-y divide-slate-100">
          {/* Header */}
          <div className="p-4 bg-slate-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 font-heading">
                Live Store Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-[#ed1d24] animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  soundEnabled
                    ? "text-[#ed1d24] hover:bg-red-50"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
                title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ed1d24] hover:text-[#d32f2f] hover:underline cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Recent Order Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  No alerts right now
                </p>
                <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                  Live alerts will pop up here whenever a customer places or cancels an order.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isCancellation = n.type === "order_cancelled";

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 sm:p-4 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      !n.isRead
                        ? isCancellation
                          ? "bg-rose-50/40"
                          : "bg-red-50/20"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isCancellation
                          ? "bg-rose-100 text-rose-600"
                          : !n.isRead
                          ? "bg-[#ed1d24] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isCancellation ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          #{n.shortId}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(n.createdAt, false)}
                        </span>
                      </div>

                      {isCancellation ? (
                        <p className="text-xs text-rose-700 leading-snug">
                          <span className="font-bold text-rose-800">
                            Order Cancelled by Customer
                          </span>
                          {n.cancellationReason && (
                            <span className="block text-[11px] text-rose-600 italic">
                              "{n.cancellationReason}"
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-600 truncate">
                          <span className="font-semibold text-slate-800">
                            {n.customerName}
                          </span>{" "}
                          placed an order for{" "}
                          <span className="font-bold text-[#ed1d24]">
                            {n.totalFormatted}
                          </span>
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-0.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-md uppercase tracking-wider ${
                            isCancellation
                              ? "text-rose-700 bg-rose-100 border border-rose-200"
                              : "text-amber-700 bg-amber-50 border border-amber-200"
                          }`}
                        >
                          {n.orderStatus || (isCancellation ? "Cancelled" : "Pending")}
                        </span>
                        {!n.isRead && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCancellation ? "bg-rose-600" : "bg-[#ed1d24]"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50/50 text-center">
            <Link
              to="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#ed1d24] hover:text-[#d32f2f] hover:underline"
            >
              <span>Manage All Orders in Admin Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
