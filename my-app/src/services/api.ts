import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dv_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Handle 401 globally — only redirect if the user WAS authenticated (had a token).
// Guest requests (no token) returning 401 are expected and must NOT redirect.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const token = localStorage.getItem('dv_token');
      if (token && path !== '/login' && path !== '/register') {
        localStorage.removeItem('dv_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
