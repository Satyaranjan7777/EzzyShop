import apiClient from "../api/axios";

let cachedCategoriesPromise = null;
let cachedCategoriesData = null;

export const categoryService = {
  /**
   * Clear in-memory categories cache
   */
  clearCategoryCache() {
    cachedCategoriesPromise = null;
    cachedCategoriesData = null;
  },

  /**
   * Get all categories (pass { all: true } for admin to get inactive ones as well)
   * Deduplicates concurrent calls and caches public categories in memory.
   * @param {Object} params
   * @returns {Promise<{ success: boolean, message: string, data: Array }>}
   */
  async getCategories(params = {}) {
    const isDefaultFetch = Object.keys(params).length === 0;

    if (isDefaultFetch && cachedCategoriesData) {
      return cachedCategoriesData;
    }

    if (isDefaultFetch && cachedCategoriesPromise) {
      return await cachedCategoriesPromise;
    }

    const requestPromise = apiClient.get("/categories", { params });

    if (isDefaultFetch) {
      cachedCategoriesPromise = requestPromise;
      try {
        const response = await requestPromise;
        cachedCategoriesData = response;
        return response;
      } catch (err) {
        cachedCategoriesPromise = null;
        throw err;
      }
    }

    return await requestPromise;
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
    const response = await apiClient.post("/categories", categoryData);
    categoryService.clearCategoryCache();
    return response;
  },

  /**
   * Update category (Admin)
   * @param {string} id
   * @param {{ name?: string, slug?: string, isActive?: boolean }} categoryData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateCategory(id, categoryData) {
    const response = await apiClient.patch(`/categories/${id}`, categoryData);
    categoryService.clearCategoryCache();
    return response;
  },

  /**
   * Delete category (Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: null }>}
   */
  async deleteCategory(id) {
    const response = await apiClient.delete(`/categories/${id}`);
    categoryService.clearCategoryCache();
    return response;
  },
};

export default categoryService;
