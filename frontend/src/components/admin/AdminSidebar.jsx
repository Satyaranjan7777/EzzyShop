import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ArrowLeft,
  Store,
  X,
} from "lucide-react";
import { useUIStore } from "../../store/ui.store";

export const AdminSidebar = () => {
  const { closeAdminSidebar } = useUIStore();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-[#ed1d24] text-white shadow-sm shadow-[#ed1d24]/20 font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-white border-r border-slate-200 p-4">
      <div className="space-y-6">
        {/* Logo and close button for mobile */}
        <div className="flex items-center justify-between px-2">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 focus:outline-none"
            onClick={closeAdminSidebar}
          >
            <div className="w-9 h-9 rounded-xl bg-[#ed1d24] text-white flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-heading">
                EzzyShop
              </span>
              <span className="text-[10px] font-bold text-[#ed1d24] uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeAdminSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Management
          </div>

          <NavLink
            to="/admin"
            end
            onClick={closeAdminSidebar}
            className={navItemClass}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/products"
            onClick={closeAdminSidebar}
            className={navItemClass}
          >
            <Package className="w-4 h-4" />
            Products
          </NavLink>

          <NavLink
            to="/admin/categories"
            onClick={closeAdminSidebar}
            className={navItemClass}
          >
            <Layers className="w-4 h-4" />
            Categories
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={closeAdminSidebar}
            className={navItemClass}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders
          </NavLink>
        </nav>
      </div>

      {/* Bottom Back to Store */}
      <div className="pt-4 border-t border-slate-100">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
