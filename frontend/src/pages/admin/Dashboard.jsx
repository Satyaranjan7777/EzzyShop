import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Layers,
  ShoppingBag,
  ArrowRight,
  Plus,
} from "lucide-react";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import { orderService } from "../../services/order.service";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import OrderTable from "../../components/admin/OrderTable";
import Button from "../../components/common/Button";

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    ordersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes, ordersRes] = await Promise.allSettled([
          productService.getProducts({ limit: 1 }),
          categoryService.getCategories({ all: true }),
          orderService.getAllOrders({ limit: 5 }),
        ]);

        if (isMounted) {
          const productsTotal =
            productsRes.status === "fulfilled"
              ? productsRes.value?.pagination?.total || 0
              : 0;

          const categoriesTotal =
            categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value?.data)
              ? categoriesRes.value.data.length
              : 0;

          const ordersTotal =
            ordersRes.status === "fulfilled"
              ? ordersRes.value?.pagination?.total || 0
              : 0;

          const recent =
            ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value?.data)
              ? ordersRes.value.data
              : [];

          setStats({
            productsCount: productsTotal,
            categoriesCount: categoriesTotal,
            ordersCount: ordersTotal,
          });
          setRecentOrders(recent);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-24">
        <Loader text="Loading administrative dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-[#0f172a] text-white p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#ed1d24]">
            Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading mt-1">
            Welcome, {user?.name || "Admin"}!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Monitor store inventory, manage product listings, organize categories, and track customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/admin/products">
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              className="bg-[#ed1d24] hover:bg-[#d32f2f] shadow-md shadow-[#ed1d24]/20 font-bold"
            >
              Add Product
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button
              variant="dark"
              size="sm"
              className="border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
            >
              Add Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Products Card */}
        <Link
          to="/admin/products"
          className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-[#ed1d24]/50 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Products
            </span>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center group-hover:bg-[#ed1d24] group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-heading mt-3">
            {stats.productsCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Manage catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Categories Card */}
        <Link
          to="/admin/categories"
          className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-[#ed1d24]/50 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Categories
            </span>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center group-hover:bg-[#ed1d24] group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-heading mt-3">
            {stats.categoriesCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Organize store taxonomy</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Orders Card */}
        <Link
          to="/admin/orders"
          className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-[#ed1d24]/50 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Customer Orders
            </span>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#ed1d24] flex items-center justify-center group-hover:bg-[#ed1d24] group-hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-heading mt-3">
            {stats.ordersCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Review & fulfill orders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Recent Customer Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-[#ed1d24] hover:text-[#d32f2f] flex items-center gap-1"
          >
            View All Orders
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No customer orders placed yet.
          </div>
        ) : (
          <OrderTable
            orders={recentOrders}
            onUpdateStatus={async (orderId, status) => {
              await orderService.updateOrderStatus(orderId, status);
              const refreshed = await orderService.getAllOrders({ limit: 5 });
              if (refreshed.data) setRecentOrders(refreshed.data);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
