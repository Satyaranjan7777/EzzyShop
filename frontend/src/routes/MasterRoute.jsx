import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

export const MasterRoute = () => {
  const { isAuthenticated, isMaster, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  if (isLoading || !isInitialized) {
    return <Loader fullScreen text="Verifying Master access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/master/login" state={{ from: location }} replace />;
  }

  if (!isMaster) {
    toast.error("Access denied: Master administrator account required.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default MasterRoute;
