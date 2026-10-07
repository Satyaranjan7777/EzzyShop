import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Calendar,
  Package,
  MapPin,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  Truck,
  CheckCircle2,
  Lock,
  ChevronRight,
  CreditCard,
  Zap,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";
import { formatCurrency } from "../../utils/formatCurrency";
import Button from "../../components/common/Button";
import { orderService } from "../../services/order.service";
import { addressService } from "../../services/address.service";
import { useCartStore } from "../../store/cart.store";

export const Profile = () => {
  const { user, isAdmin, isMaster, logout } = useAuth();
  const cartSummary = useCartStore((state) => state.summary);

  // Real-time account dashboard statistics
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [addressesCount, setAddressesCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAccountData = async () => {
      try {
        setIsLoadingData(true);
        const [ordersRes, addressesRes] = await Promise.allSettled([
          orderService.getMyOrders({ limit: 3 }),
          addressService.getAddresses(),
        ]);

        if (isMounted) {
          if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
            setRecentOrders(ordersRes.value.data || []);
            setTotalOrdersCount(
              ordersRes.value.pagination?.total ?? ordersRes.value.data?.length ?? 0
            );
          }
          if (addressesRes.status === "fulfilled" && addressesRes.value?.data) {
            setAddressesCount(addressesRes.value.data?.length || 0);
          }
        }
      } catch {
        // Fallback silently if offline or endpoint error
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    fetchAccountData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return null;

  // Dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Status color pill helper
  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase();
    switch (s) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans">
      {/* 1. Header Greeting & Quick Actions */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-[#ed1d24] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ed1d24]" />
            <span>Account Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {getGreeting()},{" "}
            <span className="text-[#ed1d24]">{user.name?.split(" ")[0] || "User"}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal profile, review recent purchases, and configure addresses.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/products" className="flex-1 sm:flex-initial">
            <Button
              variant="outline"
              size="sm"
              leftIcon={ShoppingBag}
              className="w-full text-xs font-semibold border-slate-200 text-slate-700 hover:text-[#ed1d24] hover:border-[#ed1d24]"
            >
              Continue Shopping
            </Button>
          </Link>
          <Button
            variant="dangerOutline"
            size="sm"
            leftIcon={LogOut}
            onClick={logout}
            className="text-xs font-semibold border-rose-200 hover:bg-rose-50"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* User Identity Card (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-7 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-2xl sm:text-3xl uppercase shadow-sm border border-slate-200">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="Online & Verified">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Name & Credentials */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                    {user.name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isMaster
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : isAdmin
                      ? "bg-red-50 text-[#ed1d24] border-red-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}>
                    {user.role}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Account
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-[#ed1d24]" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member Since: {formatDate(user.createdAt, false)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metadata Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#ed1d24]" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Authentication</div>
                  <div className="font-semibold text-slate-800">Password Protected</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Payment Mode</div>
                  <div className="font-semibold text-slate-800">Cash on Delivery (COD)</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Fulfillment Tier</div>
                  <div className="font-semibold text-slate-800">Standard Doorstep</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Governance Card (Span 4) */}
        <div className="lg:col-span-4 bg-[#0f172a] rounded-xl border border-slate-800 p-6 sm:p-7 flex flex-col justify-between text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#ed1d24]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Account
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Security & Platform Access
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your account is protected with secure JWT authentication and encrypted credentials.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Session Active • Strict Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Card Stored (100% COD Protected)</span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800">
            {isMaster ? (
              <Link
                to="/master/admins"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Launch Master Console
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            ) : isAdmin ? (
              <Link
                to="/admin"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs bg-[#ed1d24] hover:bg-[#d32f2f] text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Launch Admin Dashboard
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            ) : (
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Customer Access Level</span>
                <span className="font-mono text-slate-300">Standard Tier</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Metrics (Span 3 each) */}
        {/* Metric 1: Total Orders */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#ed1d24]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ed1d24] bg-red-50 px-2 py-0.5 rounded-md">
              Orders
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 font-heading">
              {isLoadingData ? "..." : totalOrdersCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Lifetime Orders</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/orders"
              className="text-[#ed1d24] hover:text-[#d32f2f] font-semibold inline-flex items-center gap-1"
            >
              Order History
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Active Cart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              In Cart
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 font-heading">
              {cartSummary?.itemCount ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Cart Items ({formatCurrency(cartSummary?.subtotal || 0)})
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/cart"
              className="text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1"
            >
              Go to Cart
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric 3: Saved Delivery Addresses */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Addresses
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 font-heading">
              {isLoadingData ? "..." : addressesCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Saved Addresses</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/addresses"
              className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
            >
              Manage Addresses
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric 4: Cash on Delivery Perk */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              Safe COD
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 font-heading">
              100% COD
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Pay on Delivery</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Free delivery on ₹1,000+</span>
          </div>
        </div>

        {/* Action Launchpad (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-[#ed1d24]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                Quick Shortcuts
              </h3>
            </div>

            <div className="space-y-2">
              <Link
                to="/orders"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Track Shipments
                    </h4>
                    <p className="text-[11px] text-slate-400">View real-time order states</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#ed1d24] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/addresses"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Delivery Addresses
                    </h4>
                    <p className="text-[11px] text-slate-400">Add or edit home & office</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/cart"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Shopping Bag
                    </h4>
                    <p className="text-[11px] text-slate-400">Review cart & checkout</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="group flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/40 hover:bg-red-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ed1d24] text-white flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Admin Portal
                      </h4>
                      <p className="text-[11px] text-[#ed1d24]">Store management</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#ed1d24] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Stream (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ed1d24]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                  Recent Orders & Activity
                </h3>
              </div>
              <Link
                to="/orders"
                className="text-xs font-semibold text-[#ed1d24] hover:text-[#d32f2f] inline-flex items-center gap-1"
              >
                View all ({totalOrdersCount})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingData ? (
              <div className="space-y-2.5 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center space-y-3 bg-slate-50/70 rounded-lg border border-slate-100">
                <div className="w-11 h-11 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No orders placed yet</h4>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
                    Browse our catalog and enjoy 100% Cash on Delivery on your order.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/products">
                    <Button variant="primary" size="sm" className="text-xs">
                      Explore Products
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                        <span className="text-slate-400">
                          • {formatDate(order.createdAt, false)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.items?.length || 1} {order.items?.length === 1 ? "item" : "items"} •{" "}
                        <strong className="text-slate-800">{formatCurrency(order.pricing?.total || order.totalAmount || 0)}</strong> via{" "}
                        <span className="uppercase font-semibold text-slate-600">{order.payment?.method || order.paymentMethod || "COD"}</span>
                      </div>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs text-[#ed1d24] bg-white border border-slate-200 hover:border-[#ed1d24] shadow-2xs transition-all self-end sm:self-center"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Free doorstep returns within 7 days</span>
            <span className="text-[#ed1d24] font-medium">100% Cash On Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
