import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0 selection:bg-indigo-500 selection:text-white">
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
