import { create } from "zustand";
import { formatCurrency } from "../utils/formatCurrency";
import toast from "react-hot-toast";

/**
 * Play a pleasant Web Audio notification chime (no external audio files needed)
 */
export const playNotificationChime = (type = "order") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";

    if (type === "cancel") {
      // Deeper two-tone for cancellation alert
      osc1.frequency.setValueAtTime(440.0, now); // A4
      osc1.frequency.setValueAtTime(349.23, now + 0.15); // F4
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    } else {
      // Cheerful chime for new order
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880.0, now + 0.12); // A5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    }

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);
  } catch (e) {
    // Autoplay restrictions or audio context not ready
  }
};

export const useAdminNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  soundEnabled: true,

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  addNewOrderNotification: (order) => {
    const { soundEnabled, notifications } = get();
    const customerName =
      order.user?.name || order.shippingAddress?.fullName || "Customer";
    const totalFormatted = formatCurrency(order.pricing?.total || 0);
    const shortId = order._id.slice(-8).toUpperCase();

    const newNotification = {
      id: `${order._id}_created_${Date.now()}`,
      orderId: order._id,
      shortId,
      type: "new_order",
      title: `New Order #${shortId}`,
      message: `${customerName} placed an order for ${totalFormatted}`,
      customerName,
      totalFormatted,
      orderStatus: order.orderStatus,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    if (soundEnabled) {
      playNotificationChime("order");
    }

    toast.success(
      `New Order #${shortId} Received!\n${customerName} • ${totalFormatted}`,
      {
        duration: 6000,
        position: "top-right",
        icon: "🔔",
      }
    );

    set({
      notifications: [newNotification, ...notifications.slice(0, 29)],
      unreadCount: get().unreadCount + 1,
    });
  },

  addOrderCancellationNotification: (order) => {
    const { soundEnabled, notifications } = get();
    const customerName =
      order.user?.name || order.shippingAddress?.fullName || "Customer";
    const shortId = order._id.slice(-8).toUpperCase();
    const reasonText = order.cancellationReason
      ? `"${order.cancellationReason}"`
      : "No reason given";

    const newNotification = {
      id: `${order._id}_cancelled_${Date.now()}`,
      orderId: order._id,
      shortId,
      type: "order_cancelled",
      title: `Order #${shortId} Cancelled`,
      message: `Cancelled by customer. Reason: ${reasonText}`,
      customerName,
      orderStatus: "cancelled",
      cancellationReason: order.cancellationReason,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    if (soundEnabled) {
      playNotificationChime("cancel");
    }

    toast.error(
      `Order #${shortId} Cancelled by Customer!\nReason: ${reasonText}`,
      {
        duration: 7000,
        position: "top-right",
        icon: "⚠️",
      }
    );

    set({
      notifications: [newNotification, ...notifications.slice(0, 29)],
      unreadCount: get().unreadCount + 1,
    });
  },

  markAsRead: (notificationId) => {
    const { notifications } = get();
    let updatedUnread = 0;

    const updated = notifications.map((n) => {
      if (n.id === notificationId || n.orderId === notificationId) {
        return { ...n, isRead: true };
      }
      if (!n.isRead) updatedUnread++;
      return n;
    });

    set({
      notifications: updated,
      unreadCount: updatedUnread,
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    set({
      notifications: updated,
      unreadCount: 0,
    });
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));

export default useAdminNotificationStore;
