import apiClient from "../api/axios";

export const addressService = {
  /**
   * Get all user addresses
   * @returns {Promise<{ success: boolean, message: string, data: Array }>}
   */
  async getAddresses() {
    return await apiClient.get("/addresses");
  },

  /**
   * Create new address
   * @param {Object} addressData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createAddress(addressData) {
    return await apiClient.post("/addresses", addressData);
  },

  /**
   * Update address
   * @param {string} id
   * @param {Object} addressData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateAddress(id, addressData) {
    return await apiClient.patch(`/addresses/${id}`, addressData);
  },

  /**
   * Delete address
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: null }>}
   */
  async deleteAddress(id) {
    return await apiClient.delete(`/addresses/${id}`);
  },
};

export default addressService;
