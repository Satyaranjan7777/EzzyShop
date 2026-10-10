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
  Layers,
  Truck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useCartStore } from "../../store/cart.store";
import { useUIStore } from "../../store/ui.store";
import { categoryService } from "../../services/category.service";
import logoImg from "../../assets/logo.png";
import AdminNotificationBell from "../admin/AdminNotificationBell";

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isMaster, logout } = useAuth();
  const cartSummary = useCartStore((state) => state.summary);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [categories, setCategories] = useState([]);

  const dropdownRef = useRef(null);
  const catDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load categories for the category navigation strip
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (isMounted && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load nav categories", err);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    closeMobileMenu();
    setUserDropdownOpen(false);
    setCategoryDropdownOpen(false);
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

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs transition-all">
      {/* Main Brand & Search Bar */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-900" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-900" />
                )}
              </button>

              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <img
                  src={logoImg}
                  alt="EzzyShop"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
                />
              </Link>
            </div>

            {/* Central Search Bar (Reference Style) */}
            <form
              onSubmit={handleNavSearchSubmit}
              className="hidden lg:flex items-center flex-1 max-w-xl mx-4"
            >
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search for products, brands and essentials..."
                  className="w-full bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm rounded-l-full py-2.5 pl-5 pr-4 placeholder:text-slate-400 focus:outline-none focus:border-[#ed1d24] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="bg-[#ed1d24] hover:bg-[#d32f2f] text-white px-6 py-2.5 rounded-r-full font-bold text-sm flex items-center justify-center transition-colors cursor-pointer border border-[#ed1d24]"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right Action Icons (User Account, Admin Bell, Cart) */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Admin Notification Bell */}
              {isAuthenticated && isAdmin && <AdminNotificationBell />}

              {/* User Account / Sign In */}
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 transition-all text-left focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-[10px] text-slate-500 font-semibold leading-tight">
                        Hello, {user.name.split(" ")[0]}
                      </span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        My Account
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 py-2 border border-slate-200 z-50 divide-y divide-slate-100 animate-in fade-in duration-150">
                      <div className="px-4 py-2.5 bg-slate-50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ed1d24]"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ed1d24]"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          My Orders
                        </Link>
                        <Link
                          to="/addresses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ed1d24]"
                        >
                          <MapPin className="w-4 h-4 text-slate-400" />
                          Delivery Addresses
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#ed1d24] bg-red-50/50 hover:bg-red-50"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#ed1d24]" />
                            Admin Dashboard
                          </Link>
                        )}
                        {isMaster && (
                          <Link
                            to="/master/admins"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100"
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
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs">
                  <Link
                    to="/login"
                    className="font-bold text-slate-700 hover:text-[#ed1d24] px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    to="/register"
                    className="font-bold text-[#ed1d24] hover:text-[#d32f2f] px-2.5 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Shopping Cart Button */}
              <Link
                to="/cart"
                className="flex items-center gap-2 py-2 px-3 rounded-full hover:bg-slate-100 transition-colors group cursor-pointer"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-slate-800 group-hover:text-[#ed1d24] transition-colors" />
                  {cartSummary.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-[#ed1d24] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                      {cartSummary.totalItems > 99 ? "99+" : cartSummary.totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 font-semibold leading-none">
                    Cart
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 leading-none mt-1">
                    {cartSummary.totalItems} Items
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Navigation Strip (Reference Style) */}
      <div className="hidden lg:block border-b border-slate-200/80 bg-white text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11">
          <div className="flex items-center gap-6">
            {/* Shop by Category Menu Button */}
            <div className="relative" ref={catDropdownRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 bg-[#ed1d24] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#d32f2f] transition-colors cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Shop By Categories</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              {/* Categories Dropdown */}
              {categoryDropdownOpen && (
                <div className="absolute left-0 mt-1 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 divide-y divide-slate-100">
                  <Link
                    to="/products"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="block px-4 py-2.5 text-xs font-bold text-slate-800 hover:text-[#ed1d24] hover:bg-red-50/40"
                  >
                    All Products Catalog
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${cat.slug || cat._id}`}
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#ed1d24] hover:bg-red-50/40"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Navigation Links */}
            <nav className="flex items-center gap-1 text-slate-700 font-semibold">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md hover:text-[#ed1d24] transition-colors ${
                    isActive ? "text-[#ed1d24] font-bold" : ""
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md hover:text-[#ed1d24] transition-colors ${
                    isActive ? "text-[#ed1d24] font-bold" : ""
                  }`
                }
              >
                Explore All
              </NavLink>

              {/* Top 5 dynamic categories */}
              {categories.slice(0, 5).map((cat) => (
                <NavLink
                  key={cat._id}
                  to={`/products?category=${cat.slug || cat._id}`}
                  className="px-3 py-1.5 rounded-md hover:text-[#ed1d24] transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right delivery guarantee pill */}
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <Truck className="w-4 h-4 text-[#ed1d24]" />
            <span>Fast Doorstep Delivery Across India</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Reference Style) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Mobile search bar */}
          <form onSubmit={handleNavSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#f8f9fa] border border-slate-300 text-slate-900 text-sm rounded-xl pl-4 pr-10 py-2.5 placeholder:text-slate-400 focus:outline-none focus:border-[#ed1d24]"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#ed1d24]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Core Links */}
          <div className="space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-sm font-bold text-slate-800 hover:text-[#ed1d24]"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 text-sm font-bold text-slate-800 hover:text-[#ed1d24]"
            >
              All Products
            </Link>
          </div>

          {/* Categories List */}
          {categories.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-1 pt-1">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat.slug || cat._id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#ed1d24] truncate"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Account Controls */}
          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="space-y-1">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Account ({user.name})
                </p>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#ed1d24]"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#ed1d24]"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  My Orders
                </Link>
                <Link
                  to="/addresses"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#ed1d24]"
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Saved Addresses
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#ed1d24] bg-red-50 rounded-lg"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Control Center
                  </Link>
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  className="py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="py-2.5 text-center text-xs font-bold text-white bg-[#ed1d24] hover:bg-[#d32f2f] rounded-lg"
                >
                  Register
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
