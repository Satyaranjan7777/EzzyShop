import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  if (isLoading || !isInitialized) {
    return <Loader fullScreen text="Verifying permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    toast.error("Access denied: Admin privileges required.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
