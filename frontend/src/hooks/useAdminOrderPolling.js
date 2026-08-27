import { useEffect, useRef } from "react";
import { orderService } from "../services/order.service";
import { useAdminNotificationStore } from "../store/adminNotification.store";
import useAuth from "./useAuth";

const POLLING_INTERVAL_MS = 6000; // 6 seconds for fast detection

/**
 * Global background polling hook that alerts Admin in real-time when:
 * 1. A new customer order is placed.
 * 2. An existing order is cancelled by the customer.
 */
export const useAdminOrderPolling = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const addNewOrderNotification = useAdminNotificationStore(
    (state) => state.addNewOrderNotification
  );
  const addOrderCancellationNotification = useAdminNotificationStore(
    (state) => state.addOrderCancellationNotification
  );

  const isInitializedRef = useRef(false);
  // Map of orderId -> { status: string, updatedAt: string }
  const knownOrdersMapRef = useRef(new Map());

  useEffect(() => {
    // Only run if user is logged in as Admin
    if (!isAuthenticated || !isAdmin) {
      isInitializedRef.current = false;
      knownOrdersMapRef.current.clear();
      return;
    }

    let isSubscribed = true;

    const pollOrders = async () => {
      try {
        const res = await orderService.getAllOrders({ limit: 30, sort: "-createdAt" });
        if (!isSubscribed || !res.data || !Array.isArray(res.data)) return;

        const orders = res.data;
        const currentMap = knownOrdersMapRef.current;

        // First run: Record existing order states baseline
        if (!isInitializedRef.current) {
          orders.forEach((ord) => {
            currentMap.set(ord._id, {
              status: ord.orderStatus,
              cancelledBy: ord.cancelledBy,
              updatedAt: ord.updatedAt,
            });
          });
          isInitializedRef.current = true;
          return;
        }

        // Subsequent polls: Compare and alert
        // Iterate oldest to newest to trigger notifications chronologically
        const reversedOrders = [...orders].reverse();

        for (const ord of reversedOrders) {
          const prev = currentMap.get(ord._id);

          if (!prev) {
            // BRAND NEW ORDER placed by customer!
            addNewOrderNotification(ord);
            currentMap.set(ord._id, {
              status: ord.orderStatus,
              cancelledBy: ord.cancelledBy,
              updatedAt: ord.updatedAt,
            });
          } else {
            // ORDER STATE CHANGED (e.g. customer cancelled order)
            if (
              prev.status !== "cancelled" &&
              ord.orderStatus === "cancelled" &&
              ord.cancelledBy === "user"
            ) {
              addOrderCancellationNotification(ord);
            }

            // Update recorded state
            currentMap.set(ord._id, {
              status: ord.orderStatus,
              cancelledBy: ord.cancelledBy,
              updatedAt: ord.updatedAt,
            });
          }
        }
      } catch (err) {
        console.warn("Background order poll error:", err?.message);
      }
    };

    // Run first check immediately
    pollOrders();

    // Poll every 6 seconds
    const intervalId = setInterval(pollOrders, POLLING_INTERVAL_MS);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [
    isAuthenticated,
    isAdmin,
    addNewOrderNotification,
    addOrderCancellationNotification,
  ]);
};

export default useAdminOrderPolling;
