import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import MasterRoute from "./MasterRoute";

// Public Pages
import Home from "../pages/public/Home";
import Products from "../pages/public/Products";
import ProductDetails from "../pages/public/ProductDetails";
import NotFound from "../pages/public/NotFound";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Master Pages
import MasterLogin from "../pages/master/MasterLogin";
import MasterAdmins from "../pages/master/MasterAdmins";
import MasterAdminActivity from "../pages/master/MasterAdminActivity";

// Protected User Pages
import Profile from "../pages/user/Profile";
import Cart from "../pages/user/Cart";
import Addresses from "../pages/user/Addresses";
import Checkout from "../pages/user/Checkout";
import Orders from "../pages/user/Orders";
import OrderDetails from "../pages/user/OrderDetails";

// Protected Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminOrders from "../pages/admin/AdminOrders";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Standalone Master Login Route */}
      <Route path="/master/login" element={<MasterLogin />} />

      {/* Protected Master Routes */}
      <Route path="/master" element={<MasterRoute />}>
        <Route index element={<Navigate to="/master/admins" replace />} />
        <Route path="admins" element={<MasterAdmins />} />
        <Route path="admins/:id/activity" element={<MasterAdminActivity />} />
        <Route path="admins/:id/activities" element={<Navigate to="../activity" replace />} />
      </Route>

      {/* Protected Admin Routes with AdminLayout */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
