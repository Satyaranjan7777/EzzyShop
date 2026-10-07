import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingBag, Package, User } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useCartStore } from "../../store/cart.store";

export const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();
  const cartSummary = useCartStore((state) => state.summary);
  const location = useLocation();

  // Hide bottom nav on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const navItemClass = ({ isActive }) =>
    `relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
      isActive
        ? "text-[#ed1d24] font-bold scale-105"
        : "text-slate-500 hover:text-slate-800 font-medium"
    }`;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <NavLink to="/" end className={navItemClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-red-50 text-[#ed1d24]" : ""}`}>
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
            </>
          )}
        </NavLink>

        {/* Shop */}
        <NavLink to="/products" className={navItemClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-red-50 text-[#ed1d24]" : ""}`}>
                <Grid className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Shop</span>
            </>
          )}
        </NavLink>

        {/* Cart */}
        <NavLink to="/cart" className={navItemClass}>
          {({ isActive }) => (
            <>
              <div className={`relative p-1 rounded-xl transition-colors ${isActive ? "bg-red-50 text-[#ed1d24]" : ""}`}>
                <ShoppingBag className="w-5 h-5" />
                {cartSummary.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 bg-[#ed1d24] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {cartSummary.totalItems > 99 ? "99+" : cartSummary.totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Cart</span>
            </>
          )}
        </NavLink>

        {/* Orders (if auth) */}
        {isAuthenticated && (
          <NavLink to="/orders" className={navItemClass}>
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-red-50 text-[#ed1d24]" : ""}`}>
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">Orders</span>
              </>
            )}
          </NavLink>
        )}

        {/* Profile or Login */}
        <NavLink to={isAuthenticated ? "/profile" : "/login"} className={navItemClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-red-50 text-[#ed1d24]" : ""}`}>
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {isAuthenticated ? "Profile" : "Sign In"}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
