import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Send,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import logoImg from "../../assets/logo.png";

export const Footer = () => {
  const [emailInput, setEmailInput] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing to our newsletter!");
    setEmailInput("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-slate-50 text-slate-600 border-t border-slate-200/80 overflow-hidden font-sans pb-14 md:pb-0">
      {/* 1. Value Propositions Banner */}
      <div className="relative border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading tracking-wide">
                  Free Express Delivery
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  On all orders over <span className="text-indigo-600 font-semibold">₹1,000</span>
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading tracking-wide">
                  Cash on Delivery
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  100% verified doorstep payment
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30 transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading tracking-wide">
                  7-Day Easy Returns
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hassle-free instant replacement
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading tracking-wide">
                  Dedicated Support
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available Mon–Sat 9AM–8PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Newsletter & Perks Bar */}
      <div className="relative border-b border-slate-200/80 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-indigo-50/60 border border-indigo-100 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Stay Ahead & Save</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Subscribe for exclusive stock updates & offers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Join our community of smart shoppers. Get notified on newest arrivals and seasonal flash promotions.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2.5 max-w-md"
            >
              <div className="relative w-full sm:w-80">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Links Columns */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Contact Information (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none w-fit">
              <img
                src={logoImg}
                alt="EzzyShop"
                className="h-10 sm:h-12 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
              />
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Your trusted online marketplace offering premium electronics, lifestyle accessories, and essentials with verified Cash on Delivery and prompt doorstep fulfillment.
            </p>

            {/* Direct Contact Details */}
            <div className="space-y-3 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium">+91 98765 43210 (Toll-Free Support)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-medium">support@ezzyshop.com</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium">Ameerpet Near Asian Satyam mall, Hyderabad, Telangana, 500016</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Shop Store
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  Storefront Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products?sort=newest"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Account */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              My Account
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/profile"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  User Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  to="/addresses"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  Saved Delivery Addresses
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout"
                  className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                >
                  Express COD Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Security, Trust & Policies */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              Trust & Security
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Doorstep Inspection</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Inspect your parcel upon delivery before handing over cash.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>256-Bit SSL Secured</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  All requests and customer credentials are authenticated securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright & System Status Bar */}
      <div className="relative border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>© {new Date().getFullYear()} EzzyShop Store Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline font-medium text-slate-700">Satyaranjan7777</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Operational Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold">Systems Operational</span>
            </div>

            {/* Back to top button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-medium"
              title="Scroll to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
