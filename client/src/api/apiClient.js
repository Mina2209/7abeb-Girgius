import axios from 'axios';
import { API_BASE } from '../config/apiConfig';

// axios instance used across the app — baseURL uses centralized API_BASE
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors by dispatching event (not hard redirect)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentToken = localStorage.getItem('authToken');
      const failedTokenHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization;

      // Only clear session if the failing request used the CURRENT token
      // This prevents background requests from old sessions from killing the new one
      const isCurrentSession = !currentToken || (failedTokenHeader && failedTokenHeader === `Bearer ${currentToken}`);

      if (isCurrentSession) {
        // Clear stored auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');

        // Dispatch custom event for AuthContext to handle
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
