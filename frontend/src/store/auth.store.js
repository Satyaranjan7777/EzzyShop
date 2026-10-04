import { create } from "zustand";
import { authService } from "../services/auth.service";
import { masterService } from "../services/master.service";
import { TOKEN_STORAGE_KEY } from "../utils/constants";
import { getErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

const initialToken =
  typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null;

export const useAuthStore = create((set, get) => ({
  user: null,
  token: initialToken,
  isAuthenticated: false,
  isLoading: Boolean(initialToken), // only loading initially if a token exists to be verified
  isInitialized: !initialToken, // immediately initialized for guest visitors with no token

  /**
   * Session Restoration: check token in current tab's sessionStorage and load user profile
   */
  getCurrentUser: async () => {
    // Clean up any legacy localStorage tokens from earlier
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}

    const token = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      return null;
    }

    try {
      set({ isLoading: true });
      const response = await authService.getMe();
      const user = response.data?.user || response.data;

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
      return user;
    } catch (error) {
      console.warn("Session restoration failed:", error?.message);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      return null;
    }
  },

  /**
   * Login user action
   */
  login: async (credentials) => {
    try {
      set({ isLoading: true });
      const response = await authService.login(credentials);
      const { user, token } = response.data;

      if (token) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(response.message || `Welcome back, ${user.name}!`);
      return { success: true, user, token };
    } catch (error) {
      set({ isLoading: false });
      const msg = getErrorMessage(error, "Login failed. Please check credentials.");
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Master login action
   */
  masterLogin: async (credentials) => {
    try {
      set({ isLoading: true });
      const response = await masterService.login(credentials);
      const { user, token } = response.data;

      if (token) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(response.message || `Welcome Master, ${user.name}!`);
      return { success: true, user, token };
    } catch (error) {
      set({ isLoading: false });
      const msg = getErrorMessage(error, "Master login failed. Access denied.");
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Register user action
   */
  register: async (userData) => {
    try {
      set({ isLoading: true });
      const response = await authService.register(userData);
      const { user, token } = response.data;

      if (token) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(response.message || "Account created successfully!");
      return { success: true, user, token };
    } catch (error) {
      set({ isLoading: false });
      const msg = getErrorMessage(error, "Registration failed.");
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Logout user action
   */
  logout: () => {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success("Logged out successfully");
  },

  /**
   * Update user details in state
   */
  setUser: (user) => set({ user }),
}));

// Listen for global unauthorized event
if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    useAuthStore.getState().logout();
  });
}
