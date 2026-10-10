import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import AdminSidebar from "../admin/AdminSidebar";
import AdminNotificationBell from "../admin/AdminNotificationBell";
import { useUIStore } from "../../store/ui.store";
import useAuth from "../../hooks/useAuth";

export const AdminLayout = () => {
  const { isAdminSidebarOpen, openAdminSidebar, closeAdminSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isAdminSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeAdminSidebar}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white z-50 animate-in slide-in-from-left duration-200">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAdminSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
              Store Administration
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Order Notification Bell */}
            <AdminNotificationBell />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-[#ed1d24] text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
