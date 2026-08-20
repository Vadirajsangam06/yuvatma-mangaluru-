import axios from 'axios';

// Vite dev proxy forwards /api → :5000; in prod set VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ym_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      error.response?.data?.message ?? error.message ?? 'Network error';
    return Promise.reject(new Error(message));
  },
);
