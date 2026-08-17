import apiClient from "../api/axios";

export const categoryService = {
  /**
   * Get all categories (pass { all: true } for admin to get inactive ones as well)
   * @param {Object} params
   * @returns {Promise<{ success: boolean, message: string, data: Array }>}
   */
  async getCategories(params = {}) {
    return await apiClient.get("/categories", { params });
  },

  /**
   * Get single category by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async getCategoryById(id) {
    return await apiClient.get(`/categories/${id}`);
  },

  /**
   * Create category (Admin)
   * @param {{ name: string, slug?: string, isActive?: boolean }} categoryData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createCategory(categoryData) {
    return await apiClient.post("/categories", categoryData);
  },

  /**
   * Update category (Admin)
   * @param {string} id
   * @param {{ name?: string, slug?: string, isActive?: boolean }} categoryData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateCategory(id, categoryData) {
    return await apiClient.patch(`/categories/${id}`, categoryData);
  },

  /**
   * Delete category (Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: null }>}
   */
  async deleteCategory(id) {
    return await apiClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
