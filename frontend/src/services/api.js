import axios from 'axios';
import { MOCK_BUSES, POPULAR_ROUTES } from '../data/mockData';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT access token from localStorage if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('yatrabus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token expiration or error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.data?.accessToken) {
      localStorage.setItem('yatrabus_token', res.data.data.accessToken);
    }
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    if (res.data?.data?.accessToken) {
      localStorage.setItem('yatrabus_token', res.data.data.accessToken);
    }
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('yatrabus_token');
    }
  },
};

// Buses Endpoints
export const busApi = {
  getBuses: async (params) => {
    try {
      const res = await apiClient.get('/buses', { params });
      return res.data?.data || [];
    } catch {
      // Fallback to mock data for resilience
      return MOCK_BUSES;
    }
  },
  getBusById: async (id) => {
    try {
      const res = await apiClient.get(`/buses/${id}`);
      return res.data?.data;
    } catch {
      return MOCK_BUSES.find((b) => b.id === id || b._id === id);
    }
  },
};

// Seats Endpoints
export const seatApi = {
  getSeats: async (busId, date) => {
    try {
      const res = await apiClient.get(`/seats/${busId}`, { params: { date } });
      return res.data?.data;
    } catch {
      return null;
    }
  },
  holdSeats: async (busId, journeyDate, seatNumbers) => {
    const res = await apiClient.post('/seats/hold', { busId, journeyDate, seatNumbers });
    return res.data;
  },
  releaseSeats: async (busId, journeyDate, seatNumbers) => {
    const res = await apiClient.post('/seats/release', { busId, journeyDate, seatNumbers });
    return res.data;
  },
};

// Booking Endpoints
export const bookingApi = {
  createBooking: async (bookingData) => {
    const res = await apiClient.post('/bookings', bookingData);
    return res.data;
  },
  getMyBookings: async () => {
    const res = await apiClient.get('/bookings/my-bookings');
    return res.data?.data || [];
  },
  getBookingByReference: async (reference) => {
    const res = await apiClient.get(`/bookings/${reference}`);
    return res.data?.data;
  },
  cancelBooking: async (id, reason) => {
    const res = await apiClient.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },
};

const adminResourcePath = (resource) => `/admin/${resource}`;

const adminRequestData = async (request) => {
  const res = await request;
  return res.data?.data;
};

// Admin Endpoints
export const adminApi = {
  getManagementData: async () => {
    const resources = [
      'buses',
      'routes',
      'schedules',
      'bookings',
      'passengers',
      'drivers',
      'staff',
      'payments',
      'offers',
      'reviews',
      'notifications',
      'settings',
    ];
    const values = await Promise.all(
      resources.map((resource) =>
        adminRequestData(apiClient.get(adminResourcePath(resource)))
      )
    );
    return Object.fromEntries(resources.map((resource, index) => [resource, values[index]]));
  },
  createResource: async (resource, data) =>
    adminRequestData(apiClient.post(adminResourcePath(resource), data)),
  updateResource: async (resource, id, data) =>
    adminRequestData(apiClient.put(`${adminResourcePath(resource)}/${id}`, data)),
  deleteResource: async (resource, id) =>
    adminRequestData(apiClient.delete(`${adminResourcePath(resource)}/${id}`)),
  cancelBooking: async (id, reason) =>
    adminRequestData(apiClient.post(`${adminResourcePath('bookings')}/${id}/cancel`, { reason })),
  togglePassengerStatus: async (id) =>
    adminRequestData(apiClient.patch(`${adminResourcePath('passengers')}/${id}/status`)),
  refundPayment: async (id) =>
    adminRequestData(apiClient.post(`${adminResourcePath('payments')}/${id}/refund`)),
  updateReviewStatus: async (id, status) =>
    adminRequestData(apiClient.patch(`${adminResourcePath('reviews')}/${id}/status`, { status })),
  markNotificationRead: async (id) =>
    adminRequestData(apiClient.patch(`${adminResourcePath('notifications')}/${id}/read`)),
  markAllNotificationsRead: async () =>
    adminRequestData(apiClient.patch(`${adminResourcePath('notifications')}/read-all`)),
  updateSettings: async (settings) =>
    adminRequestData(apiClient.put(`${adminResourcePath('settings')}`, settings)),
  changePassword: async (currentPassword, newPassword) =>
    adminRequestData(
      apiClient.post(`${adminResourcePath('change-password')}`, { currentPassword, newPassword })
    ),
  getDashboardMetrics: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data?.data;
  },
  getAllUsers: async () => {
    const res = await apiClient.get('/admin/users');
    return res.data?.data;
  },
  getAllBookings: async (params) => {
    const res = await apiClient.get('/admin/bookings', { params });
    return res.data?.data;
  },
  getReports: async (params) => {
    const res = await apiClient.get('/admin/reports', { params });
    return res.data?.data;
  },
};

// Route Endpoints
export const routeApi = {
  getRoutes: async () => {
    try {
      const res = await apiClient.get('/routes');
      return res.data?.data || [];
    } catch {
      return POPULAR_ROUTES;
    }
  },
};

export default apiClient;
