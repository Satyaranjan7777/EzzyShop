import apiClient from "../api/axios";

export const orderService = {
  /**
   * Create an order from cart
   * @param {{ addressId?: string, shippingAddress?: Object, paymentMethod?: string }} orderData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createOrder(orderData) {
    return await apiClient.post("/orders", orderData);
  },

  /**
   * Get authenticated user's order history
   * @param {Object} params - { page, limit }
   * @returns {Promise<{ success: boolean, message: string, data: Array, pagination: Object }>}
   */
  async getMyOrders(params = {}) {
    return await apiClient.get("/orders/my-orders", { params });
  },

  /**
   * Get single order by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async getOrderById(id) {
    return await apiClient.get(`/orders/${id}`);
  },

  /**
   * Get all orders (Admin)
   * @param {Object} params - { status, page, limit, sort }
   * @returns {Promise<{ success: boolean, message: string, data: Array, pagination: Object }>}
   */
  async getAllOrders(params = {}) {
    return await apiClient.get("/orders", { params });
  },

  /**
   * Update order status (Admin)
   * @param {string} id
   * @param {string} orderStatus
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateOrderStatus(id, orderStatus) {
    return await apiClient.patch(`/orders/${id}/status`, { orderStatus });
  },

  /**
   * Cancel order (Customer)
   * @param {string} id
   * @param {string} [reason]
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async cancelOrder(id, reason = "") {
    return await apiClient.patch(`/orders/${id}/cancel`, { reason });
  },
};

export default orderService;
