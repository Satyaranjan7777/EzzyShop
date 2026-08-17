import { create } from "zustand";
import { cartService } from "../services/cart.service";
import { getErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  summary: {
    totalItems: 0,
    subtotal: 0,
  },
  isLoading: false,
  isUpdating: false,

  /**
   * Fetch authenticated user's cart
   */
  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const response = await cartService.getCart();
      const cartData = response.data || { items: [], summary: { totalItems: 0, subtotal: 0 } };

      set({
        cart: cartData,
        items: cartData.items || [],
        summary: cartData.summary || {
          totalItems: (cartData.items || []).reduce((acc, item) => acc + item.quantity, 0),
          subtotal: (cartData.items || []).reduce((acc, item) => acc + (item.itemTotal || 0), 0),
        },
        isLoading: false,
      });
      return cartData;
    } catch (error) {
      set({ isLoading: false });
      // Non-intrusive logging if unauthenticated or error
      return null;
    }
  },

  /**
   * Add product to cart
   */
  addToCart: async (productId, quantity = 1) => {
    try {
      set({ isUpdating: true });
      const response = await cartService.addToCart(productId, quantity);
      const cartData = response.data;

      set({
        cart: cartData,
        items: cartData.items || [],
        summary: cartData.summary || {
          totalItems: (cartData.items || []).reduce((acc, item) => acc + item.quantity, 0),
          subtotal: (cartData.items || []).reduce((acc, item) => acc + (item.itemTotal || 0), 0),
        },
        isUpdating: false,
      });

      toast.success(response.message || "Added to cart!");
      return { success: true, cart: cartData };
    } catch (error) {
      set({ isUpdating: false });
      const message = getErrorMessage(error, "Failed to add product to cart");
      toast.error(message);
      throw error;
    }
  },

  /**
   * Update item quantity in cart
   */
  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      set({ isUpdating: true });
      const response = await cartService.updateCartItem(productId, quantity);
      const cartData = response.data;

      set({
        cart: cartData,
        items: cartData.items || [],
        summary: cartData.summary || {
          totalItems: (cartData.items || []).reduce((acc, item) => acc + item.quantity, 0),
          subtotal: (cartData.items || []).reduce((acc, item) => acc + (item.itemTotal || 0), 0),
        },
        isUpdating: false,
      });

      return { success: true, cart: cartData };
    } catch (error) {
      set({ isUpdating: false });
      const message = getErrorMessage(error, "Failed to update quantity");
      toast.error(message);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeItem: async (productId) => {
    try {
      set({ isUpdating: true });
      const response = await cartService.removeCartItem(productId);
      const cartData = response.data;

      set({
        cart: cartData,
        items: cartData.items || [],
        summary: cartData.summary || {
          totalItems: (cartData.items || []).reduce((acc, item) => acc + item.quantity, 0),
          subtotal: (cartData.items || []).reduce((acc, item) => acc + (item.itemTotal || 0), 0),
        },
        isUpdating: false,
      });

      toast.success("Item removed from cart");
      return { success: true, cart: cartData };
    } catch (error) {
      set({ isUpdating: false });
      const message = getErrorMessage(error, "Failed to remove item");
      toast.error(message);
      throw error;
    }
  },

  /**
   * Clear user's entire cart
   */
  clearCart: async () => {
    try {
      set({ isUpdating: true });
      const response = await cartService.clearCart();
      const cartData = response.data;

      set({
        cart: cartData,
        items: [],
        summary: { totalItems: 0, subtotal: 0 },
        isUpdating: false,
      });

      toast.success("Cart cleared");
      return { success: true };
    } catch (error) {
      set({ isUpdating: false });
      const message = getErrorMessage(error, "Failed to clear cart");
      toast.error(message);
      throw error;
    }
  },

  /**
   * Reset local cart state on logout
   */
  resetCartState: () => {
    set({
      cart: null,
      items: [],
      summary: { totalItems: 0, subtotal: 0 },
      isLoading: false,
      isUpdating: false,
    });
  },
}));
