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
    <footer className="relative bg-[#f8f9fa] text-slate-600 border-t border-slate-200 overflow-hidden font-sans pb-14 md:pb-0">
      {/* 1. Value Propositions Banner */}
      <div className="relative border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#ed1d24]/50 transition-all duration-200 shadow-2xs">
              <div className="w-11 h-11 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading">
                  Free Express Delivery
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  On orders over <span className="text-[#ed1d24] font-bold">₹1,000</span>
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#ed1d24]/50 transition-all duration-200 shadow-2xs">
              <div className="w-11 h-11 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading">
                  Cash on Delivery
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  100% verified doorstep pay
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#ed1d24]/50 transition-all duration-200 shadow-2xs">
              <div className="w-11 h-11 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading">
                  7-Day Easy Returns
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hassle-free replacements
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#ed1d24]/50 transition-all duration-200 shadow-2xs">
              <div className="w-11 h-11 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm font-heading">
                  Dedicated Support
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mon–Sat 9AM–8PM IST
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Newsletter Banner */}
      <div className="relative border-b border-slate-200 bg-[#002d2b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#ff5252]" />
                <span>Stay Ahead & Save</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                Subscribe for exclusive stock updates & offers
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Get notified on newest arrivals, clearance deals and seasonal discounts.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2 max-w-md"
            >
              <div className="relative w-full sm:w-72">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full bg-white text-slate-900 text-sm rounded-lg pl-10 pr-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ed1d24]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#ed1d24] hover:bg-[#d32f2f] text-white text-sm font-bold shadow-md shadow-[#ed1d24]/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Links Columns */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Brand & Contact Information (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none w-fit">
              <img
                src={logoImg}
                alt="EzzyShop"
                className="h-10 sm:h-11 w-auto object-contain mix-blend-multiply"
              />
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              Your trusted destination for premium electronics, modern lifestyle accessories, and daily essentials with verified Cash on Delivery and prompt doorstep delivery.
            </p>

            {/* Direct Contact Details */}
            <div className="space-y-2.5 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">+91 98765 43210 (Toll-Free Helpline)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">support@ezzyshop.com</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-600">Ameerpet Near Asian Satyam Mall, Hyderabad, TS, 500016</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3.5">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ed1d24]" />
              Store Directory
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  Storefront Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products?sort=newest"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Account */}
          <div className="space-y-3.5">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ed1d24]" />
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/profile"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  Account Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  to="/addresses"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  Delivery Addresses
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout"
                  className="text-slate-600 hover:text-[#ed1d24] transition-colors"
                >
                  Cash on Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Policies */}
          <div className="space-y-3.5">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Trust & Security
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doorstep Inspection</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Inspect your parcel before paying on delivery.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Lock className="w-3.5 h-3.5 text-[#ed1d24]" />
                  <span>256-Bit SSL Protection</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Every transaction is secured and encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright & System Status Bar */}
      <div className="relative border-t border-slate-200 bg-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>© {new Date().getFullYear()} EzzyShop Store Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline font-medium text-slate-700">Official E-Commerce Store</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Operational Status Pill */}
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold">Doorstep COD Available</span>
            </div>

            {/* Back to top button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-medium"
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
