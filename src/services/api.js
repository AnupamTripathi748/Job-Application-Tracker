import axios from 'axios';

// Create a custom axios instance with relative URL pointing to our Express server
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('job_tracker_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch global auth errors (like expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect or trigger a refresh if authenticated
      localStorage.removeItem('job_tracker_token');
      localStorage.removeItem('job_tracker_user');
      localStorage.removeItem('job_tracker_location');
    }
    return Promise.reject(error);
  }
);

export default api;
