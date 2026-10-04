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
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "processing":
        return "bg-sky-50 text-sky-700 border-sky-200/80";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans">
      {/* 1. Header Greeting & Quick Actions */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Account Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
            {getGreeting()}, <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">{user.name?.split(" ")[0] || "User"}</span>!
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
              className="w-full text-xs font-semibold border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300"
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

      {/* 2. VibeUI Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* BENTO CARD 1: User Identity & Membership Dossier (Span 8) */}
        <div className="lg:col-span-8 vibe-bento-card p-6 sm:p-8 flex flex-col justify-between overflow-hidden group">
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Dual-Glow Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center font-black text-3xl sm:text-4xl uppercase shadow-xl shadow-indigo-600/30 border-2 border-white/60">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="Online & Verified">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Name & Credentials */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {user.name}
                  </h2>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isMaster
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                      : isAdmin
                      ? "bg-indigo-500/10 text-indigo-700 border-indigo-500/30"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}>
                    {user.role}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Access
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
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
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Authentication</div>
                  <div className="font-semibold text-slate-800">Password Verified</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Default Payment</div>
                  <div className="font-semibold text-slate-800">Cash on Delivery (COD)</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Delivery Tier</div>
                  <div className="font-semibold text-slate-800">Doorstep Standard</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO CARD 2: Security & Platform Oversight (Span 4, Dark Tech Vibe) */}
        <div className="lg:col-span-4 vibe-bento-dark p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
          {/* Ambient Orb */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Security Rating: High
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Account & Governance
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your account is protected with JWT token rotation and secure bcrypt hashing.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Session Active • Strict Cookie Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Role-Based Permissions Enforced</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Stored Card Data (COD Only)</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-5 mt-4 border-t border-slate-800">
            {isMaster ? (
              <Link
                to="/master/admins"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Launch Master Console
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            ) : isAdmin ? (
              <Link
                to="/admin"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Launch Admin Dashboard
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            ) : (
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Customer Access Level</span>
                <span className="text-slate-400 font-mono">v1.2 Secure</span>
              </div>
            )}
          </div>
        </div>

        {/* BENTO STATS ROW (4 Metrics, Span 3 each) */}
        {/* Metric 1: Total Orders */}
        <div className="lg:col-span-3 vibe-bento-card p-5 sm:p-6 group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-full">
              Fulfillment
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoadingData ? "..." : totalOrdersCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Lifetime Orders</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/orders"
              className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Order History
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Active Cart */}
        <div className="lg:col-span-3 vibe-bento-card p-5 sm:p-6 group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50/60 px-2 py-0.5 rounded-full">
              Ready to Buy
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {cartSummary?.itemCount ?? 0}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Cart Items ({formatCurrency(cartSummary?.subtotal || 0)})
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/cart"
              className="text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Go to Cart
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric 3: Saved Delivery Addresses */}
        <div className="lg:col-span-3 vibe-bento-card p-5 sm:p-6 group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded-full">
              Logistics
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoadingData ? "..." : addressesCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Saved Addresses</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/addresses"
              className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Manage Addresses
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric 4: Cash on Delivery Perk */}
        <div className="lg:col-span-3 vibe-bento-card p-5 sm:p-6 group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50/60 px-2 py-0.5 rounded-full">
              Safe COD
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              100% COD
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Pay on Delivery</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Free delivery on ₹1,000+</span>
          </div>
        </div>

        {/* BENTO CARD 3: Quick Action Launchpad (Span 4) */}
        <div className="lg:col-span-4 vibe-bento-card p-6 sm:p-7 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Action Launchpad
              </h3>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/orders"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Track Shipments
                    </h4>
                    <p className="text-[11px] text-slate-400">View real-time order states</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/addresses"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-200/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Delivery Addresses
                    </h4>
                    <p className="text-[11px] text-slate-400">Add or edit home & office</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/cart"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-amber-50/30 hover:border-amber-200/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
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
                  className="group flex items-center justify-between p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900">
                        Admin Portal
                      </h4>
                      <p className="text-[11px] text-indigo-600">Inventory & order handling</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {isMaster && (
                <Link
                  to="/master/admins"
                  className="group flex items-center justify-between p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Master Governance
                      </h4>
                      <p className="text-[11px] text-amber-600">Platform control & audit trail</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* BENTO CARD 4: Recent Orders Stream & Activity (Span 8) */}
        <div className="lg:col-span-8 vibe-bento-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Recent Orders & Activity
                </h3>
              </div>
              <Link
                to="/orders"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                View all ({totalOrdersCount})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingData ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-100/70 animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No orders placed yet</h4>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
                    Browse our handcrafted catalog and enjoy 100% Cash on Delivery on your first order.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/products">
                    <Button variant="primary" size="sm" className="text-xs shadow-md shadow-indigo-600/20">
                      Explore Products
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-indigo-200/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                        <span className="text-slate-400">
                          • {formatDate(order.createdAt, false)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.items?.length || 1} {order.items?.length === 1 ? "item" : "items"} •{" "}
                        <strong className="text-slate-800">{formatCurrency(order.totalAmount)}</strong> via{" "}
                        <span className="uppercase font-semibold text-slate-600">{order.paymentMethod || "COD"}</span>
                      </div>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 shadow-2xs transition-all self-end sm:self-center"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Free returns within 7 days on all COD items</span>
            <span className="text-indigo-600 font-medium">Safe Doorstep Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
