import axios from "axios";
import { API_BASE_URL, TOKEN_STORAGE_KEY } from "../utils/constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Could not read auth token from sessionStorage", err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors uniformly
apiClient.interceptors.response.use(
  (response) => {
    // Return standard response body
    return response.data;
  },
  (error) => {
    // Handle 401 token expiry/invalidation cleanly
    if (error.response && error.response.status === 401) {
      const isAuthCheck = error.config?.url?.includes("/auth/me");
      const isLoginOrRegister =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      // Only clean up token on invalid session, not on wrong password
      if (!isLoginOrRegister) {
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          // ignore
        }
        // Emit custom event if needed so store can reset without hard reload loop
        if (!isAuthCheck) {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
