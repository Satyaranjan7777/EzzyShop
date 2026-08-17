import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Calendar,
  Package,
  MapPin,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";
import Button from "../../components/common/Button";

export const Profile = () => {
  const { user, isAdmin, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          My Account
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account profile, orders, and addresses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md shadow-indigo-600/30">
            {user.name ? user.name.charAt(0) : "U"}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {user.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user.role}
            </span>

            {user.isActive !== false && (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            )}
          </div>

          <div className="w-full pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500 text-left">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined: {formatDate(user.createdAt, false)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>

          <div className="w-full pt-2">
            <Button
              variant="dangerOutline"
              size="sm"
              leftIcon={LogOut}
              onClick={logout}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Shortcuts & Quick Actions */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Quick Shortcuts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/orders"
                className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500/80 hover:bg-indigo-50/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    My Orders
                  </h4>
                  <p className="text-xs text-slate-400">Track shipments & history</p>
                </div>
              </Link>

              <Link
                to="/addresses"
                className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500/80 hover:bg-indigo-50/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Saved Addresses
                  </h4>
                  <p className="text-xs text-slate-400">Manage delivery locations</p>
                </div>
              </Link>

              <Link
                to="/cart"
                className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500/80 hover:bg-indigo-50/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Shopping Cart
                  </h4>
                  <p className="text-xs text-slate-400">View items ready to buy</p>
                </div>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">
                      Admin Dashboard
                    </h4>
                    <p className="text-xs text-indigo-600">Manage products & orders</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
