import { useState, useCallback } from "react";
import { productService } from "../services/product.service";
import { getErrorMessage } from "../utils/helpers";

/**
 * Custom hook to fetch and manage product listings
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productService.getProducts(params);

      setProducts(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load products");
      setError(msg);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    pagination,
    isLoading,
    error,
    fetchProducts,
  };
};

export default useProducts;
