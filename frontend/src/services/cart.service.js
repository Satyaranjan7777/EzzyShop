import apiClient from "../api/axios";

export const cartService = {
  /**
   * Get user cart
   * @returns {Promise<{ success: boolean, message: string, data: { _id: string, items: Array, summary: { totalItems: number, subtotal: number } } }>}
   */
  async getCart() {
    return await apiClient.get("/cart");
  },

  /**
   * Add item to cart
   * @param {string} productId
   * @param {number} quantity
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async addToCart(productId, quantity = 1) {
    return await apiClient.post("/cart/items", { productId, quantity });
  },

  /**
   * Update quantity of an item in cart
   * @param {string} productId
   * @param {number} quantity
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateCartItem(productId, quantity) {
    return await apiClient.patch(`/cart/items/${productId}`, { quantity });
  },

  /**
   * Remove item from cart
   * @param {string} productId
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async removeCartItem(productId) {
    return await apiClient.delete(`/cart/items/${productId}`);
  },

  /**
   * Clear entire cart
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async clearCart() {
    return await apiClient.delete("/cart");
  },
};

export default cartService;
