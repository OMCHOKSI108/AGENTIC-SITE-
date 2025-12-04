import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if backend URL changes

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on an auth page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
        // Clear token and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const agentApi = {
  // Get all agents
  getAgents: () => api.get('/agents'),

  // Get specific agent details
  getAgent: (id) => api.get(`/agents/${id}`),

  // Run an agent
  runAgent: (id, data) => {
    const isFormData = data instanceof FormData;
    return api.post(`/agents/${id}/run`, data, {
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data',
      } : {
        'Content-Type': 'application/json',
      },
    });
  },
};

export default api;