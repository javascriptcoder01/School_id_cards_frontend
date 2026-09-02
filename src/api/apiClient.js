import axios from 'axios';
import { getAuthToken, clearAuthStorage } from '../utils/storage.js';
import { normalizeApiError } from './apiError.js';

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

/**
 * Centralized Axios Instance
 */
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Request Interceptor: Attach Bearer token safely
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && typeof token === 'string' && token.trim().length > 0 && token !== 'null' && token !== 'undefined') {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

// Response Interceptor: Extract data and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const normalized = normalizeApiError(error);

    // Handle 401 Unauthorized globally
    if (normalized.statusCode === 401) {
      clearAuthStorage();
      if (typeof unauthorizedHandler === 'function') {
        try {
          unauthorizedHandler(normalized);
        } catch {
          // Fail safely
        }
      }
    }

    return Promise.reject(normalized);
  }
);

export default apiClient;
