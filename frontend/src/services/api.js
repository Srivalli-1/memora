import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_URL}/api`
});

// Attach JWT token to all outbound requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('memora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/signup');
      if (!isAuthUrl) {
        localStorage.removeItem('memora_token');
        localStorage.removeItem('memora_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
