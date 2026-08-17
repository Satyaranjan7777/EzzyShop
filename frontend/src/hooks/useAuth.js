import { useAuthStore } from "../store/auth.store";
import { useCartStore } from "../store/cart.store";

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    getCurrentUser,
    setUser,
  } = useAuthStore();

  const resetCartState = useCartStore((state) => state.resetCartState);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const login = async (credentials) => {
    const result = await storeLogin(credentials);
    // Fetch user's cart on successful login
    fetchCart();
    return result;
  };

  const register = async (userData) => {
    const result = await storeRegister(userData);
    // Fetch user's cart on successful registration
    fetchCart();
    return result;
  };

  const logout = () => {
    storeLogout();
    resetCartState();
  };

  const isAdmin = user?.role === "admin";

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    isAdmin,
    login,
    register,
    logout,
    getCurrentUser,
    setUser,
  };
};

export default useAuth;
