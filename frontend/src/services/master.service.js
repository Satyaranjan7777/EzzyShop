import apiClient from "../api/axios";

export const masterService = {
  /**
   * Master login
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, message: string, data: { user: Object, token: string } }>}
   */
  async login(credentials) {
    return await apiClient.post("/master/login", credentials);
  },

  /**
   * Get all admin users
   * @param {string} [search]
   * @returns {Promise<{ success: boolean, data: { admins: Array, count: number } }>}
   */
  async getAdmins(search = "") {
    const params = search ? { search } : {};
    return await apiClient.get("/master/admins", { params });
  },

  /**
   * Get single admin by id
   * @param {string} id
   * @returns {Promise<{ success: boolean, data: { admin: Object } }>}
   */
  async getAdminById(id) {
    return await apiClient.get(`/master/admins/${id}`);
  },

  /**
   * Create a new admin
   * @param {{ name: string, email: string, password: string }} adminData
   * @returns {Promise<{ success: boolean, message: string, data: { admin: Object } }>}
   */
  async createAdmin(adminData) {
    return await apiClient.post("/master/admins", adminData);
  },

  /**
   * Update admin details or status
   * @param {string} id
   * @param {{ name?: string, email?: string, isActive?: boolean, password?: string }} updateData
   * @returns {Promise<{ success: boolean, message: string, data: { admin: Object } }>}
   */
  async updateAdmin(id, updateData) {
    return await apiClient.put(`/master/admins/${id}`, updateData);
  },

  /**
   * Delete an admin
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteAdmin(id) {
    return await apiClient.delete(`/master/admins/${id}`);
  },

  /**
   * Get Master executive platform overview metrics
   * @returns {Promise<{ success: boolean, data: { stats: Object, recentActivities: Array } }>}
   */
  async getOverview() {
    return await apiClient.get("/master/overview");
  },

  /**
   * Get admin activity audit trail
   * @param {Object} [params]
   * @returns {Promise<{ success: boolean, data: { activities: Array, pagination: Object } }>}
   */
  async getActivities(params = {}) {
    return await apiClient.get("/master/activities", { params });
  },

  /**
   * Get activity logs of a specific admin
   * @param {string} adminId
   * @returns {Promise<{ success: boolean, data: { admin: Object, activities: Array } }>}
   */
  async getAdminActivities(adminId) {
    return await apiClient.get(`/master/admins/${adminId}/activities`);
  },
};

export default masterService;
