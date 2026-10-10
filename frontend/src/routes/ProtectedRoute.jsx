import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

export const ProtectedRoute = () => {
  const { isAuthenticated, isAdmin, isMaster, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  if (isLoading || !isInitialized) {
    return <Loader fullScreen text="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isMaster) {
    return <Navigate to="/master/admins" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
