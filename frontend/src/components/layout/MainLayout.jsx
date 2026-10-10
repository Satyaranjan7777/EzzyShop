import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import useAuth from "../../hooks/useAuth";

export const MainLayout = () => {
  const { isAuthenticated, isAdmin, isMaster } = useAuth();

  // Admin users only have the admin panel, no store interface
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Master users only have the master panel
  if (isAuthenticated && isMaster) {
    return <Navigate to="/master/admins" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0 selection:bg-[#ed1d24] selection:text-white">
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
