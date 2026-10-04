import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  MapPin,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Search,
  ShieldCheck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useCartStore } from "../../store/cart.store";
import { useUIStore } from "../../store/ui.store";
import logoImg from "../../assets/logo.png";
import AdminNotificationBell from "../admin/AdminNotificationBell";

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isMaster, logout } = useAuth();
  const cartSummary = useCartStore((state) => state.summary);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
    setUserDropdownOpen(false);
  }, [location.pathname, closeMobileMenu]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    } else if (location.pathname === "/products") {
      navigate("/products");
      setNavSearch("");
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-all px-4 py-2 rounded-xl flex items-center gap-1.5 ${
      isActive
        ? "text-indigo-600 bg-indigo-50/80 shadow-xs"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
      isActive
        ? "bg-indigo-50 text-indigo-600 shadow-xs"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 supports-[backdrop-filter]:bg-white/75 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none shrink-0"
            >
              <img
                src={logoImg}
                alt="EzzyShop"
                className="h-10 sm:h-12 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                Explore Products
              </NavLink>
            </nav>
          </div>

          {/* Center Search Input on Desktop */}
          <form
            onSubmit={handleNavSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search products, brands, essentials..."
                className="w-full bg-slate-100/80 border border-slate-200/80 text-slate-900 text-sm rounded-2xl pl-10 pr-4 py-2.5 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
              />
            </div>
          </form>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Admin Notification Bell for New Orders */}
            {isAuthenticated && isAdmin && <AdminNotificationBell />}

            {/* Cart Icon with Counter */}
            <Link
              to="/cart"
              className="relative p-2.5 sm:p-3 rounded-2xl text-slate-700 hover:text-indigo-600 bg-slate-100/70 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 transition-all duration-200 focus:outline-none group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartSummary.totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md shadow-indigo-600/30 animate-in zoom-in ring-2 ring-white">
                  {cartSummary.totalItems > 99 ? "99+" : cartSummary.totalItems}
                </span>
              )}
            </Link>

            {/* Authenticated User Menu or Login/Register */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-left focus:outline-none shadow-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[110px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 py-2 border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
                    <div className="px-4 py-3 bg-slate-50/50">
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-extrabold text-slate-900 truncate font-heading mt-0.5">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders
                      </Link>

                      <Link
                        to="/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        Saved Addresses
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/70 font-bold transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          Admin Panel
                        </Link>
                      )}

                      {isMaster && (
                        <Link
                          to="/master/admins"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 bg-amber-50/80 hover:bg-amber-100 font-bold transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Master Console
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50/80 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-3 duration-200 shadow-xl">
          {/* Mobile search bar */}
          <form onSubmit={handleNavSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-100 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </form>

          <nav className="space-y-1">
            <NavLink to="/" className={mobileNavLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={mobileNavLinkClass}>
              Explore Products
            </NavLink>
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="space-y-1">
                <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Account Management
                </div>
                <NavLink to="/profile" className={mobileNavLinkClass}>
                  <UserIcon className="w-5 h-5 text-slate-400" />
                  My Profile
                </NavLink>
                <NavLink to="/orders" className={mobileNavLinkClass}>
                  <Package className="w-5 h-5 text-slate-400" />
                  My Orders
                </NavLink>
                <NavLink to="/addresses" className={mobileNavLinkClass}>
                  <MapPin className="w-5 h-5 text-slate-400" />
                  Saved Addresses
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-indigo-700 bg-indigo-50/80"
                  >
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    Admin Control Center
                  </NavLink>
                )}
                {isMaster && (
                  <NavLink
                    to="/master/admins"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-amber-700 bg-amber-50/80"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    Master Console
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  className="w-full py-3 text-center text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full py-3 text-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
