import axios from 'axios';

// Default to relative '/api' route so it works seamlessly on the same origin (local, production, Vercel)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Mock Token (Authentication-Ready architecture)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const mockToken = localStorage.getItem('auth_token') || 'mock-dev-token';
      if (mockToken && config.headers) {
        config.headers.Authorization = `Bearer ${mockToken}`;
      }
    } else {
      config.headers.Authorization = 'Bearer mock-dev-token';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to unwrap standardized envelope { statusCode, data }
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.statusCode !== undefined && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const rawMsg = error.response?.data?.message || error.message || 'An API error occurred';
    const errorMsg = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg;
    console.error('API Client Error:', errorMsg);
    return Promise.reject(error);
  }
);
