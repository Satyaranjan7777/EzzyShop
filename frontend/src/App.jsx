import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";
import { useAuthStore } from "./store/auth.store";
import { useCartStore } from "./store/cart.store";
import useAdminOrderPolling from "./hooks/useAdminOrderPolling";

// Global background poller for live admin alerts
const GlobalAdminNotifier = () => {
  useAdminOrderPolling();
  return null;
};

export function App() {
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    const initSession = async () => {
      const user = await getCurrentUser();
      if (user) {
        fetchCart();
      }
    };
    initSession();
  }, [getCurrentUser, fetchCart]);

  return (
    <BrowserRouter>
      {/* Global Admin Order & Cancellation Poller */}
      <GlobalAdminNotifier />
      {/* Global Scroll Restoration and Floating Back-to-Top FAB */}
      <ScrollToTop />
      <AppRoutes />
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 3500,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            fontWeight: 500,
            padding: "12px 18px",
          },
          success: {
            iconTheme: {
              primary: "#4f46e5",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#e11d48",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;