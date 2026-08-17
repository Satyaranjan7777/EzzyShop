import apiClient from "../api/axios";

export const productService = {
  /**
   * Get paginated products with filtering, search and sort
   * @param {Object} params - { search, category, sort, page, limit, minPrice, maxPrice, inStock }
   * @returns {Promise<{ success: boolean, message: string, data: Array, pagination: Object }>}
   */
  async getProducts(params = {}) {
    return await apiClient.get("/products", { params });
  },

  /**
   * Get single product by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async getProductById(id) {
    return await apiClient.get(`/products/${id}`);
  },

  /**
   * Create product (Admin)
   * @param {Object} productData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createProduct(productData) {
    return await apiClient.post("/products", productData);
  },

  /**
   * Update product (Admin)
   * @param {string} id
   * @param {Object} productData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateProduct(id, productData) {
    return await apiClient.patch(`/products/${id}`, productData);
  },

  /**
   * Delete product (Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: null }>}
   */
  async deleteProduct(id) {
    return await apiClient.delete(`/products/${id}`);
  },
};

export default productService;
