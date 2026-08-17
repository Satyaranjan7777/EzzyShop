import apiClient from "../api/axios";

export const authService = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string, role?: string }} userData
   * @returns {Promise<{ success: boolean, message: string, data: { user: Object, token: string } }>}
   */
  async register(userData) {
    return await apiClient.post("/auth/register", userData);
  },

  /**
   * Login user
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, message: string, data: { user: Object, token: string } }>}
   */
  async login(credentials) {
    return await apiClient.post("/auth/login", credentials);
  },

  /**
   * Get current authenticated user profile
   * @returns {Promise<{ success: boolean, message: string, data: { user: Object } }>}
   */
  async getMe() {
    return await apiClient.get("/auth/me");
  },
};

export default authService;
