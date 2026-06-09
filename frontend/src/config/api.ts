import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const catImageUrl = (image: string) =>
  image.startsWith('http') ? image : `${API_ORIGIN}${image}`;

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors (staff routes only)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname;
    const isStaffRoute =
      path.startsWith('/dashboard') ||
      path.startsWith('/visit-requests') ||
      path.startsWith('/clients') ||
      path.startsWith('/orders');
    if (error.response?.status === 401 && isStaffRoute) {
      localStorage.removeItem('access_token');
      window.location.href = '/staff/login';
    }
    return Promise.reject(error);
  }
);
