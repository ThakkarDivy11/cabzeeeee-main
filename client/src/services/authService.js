import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh-token', {
            refreshToken,
          });

          if (response.data.success) {
            const { token } = response.data.data;
            localStorage.setItem('token', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    try {
      const response = await api.post('/auth/verify-otp', otpData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Resend OTP
  resendOTP: async (emailData) => {
    try {
      const response = await api.post('/auth/resend-otp', emailData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (emailData) => {
    try {
      const response = await api.post('/auth/forgot-password', emailData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;







