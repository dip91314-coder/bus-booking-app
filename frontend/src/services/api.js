import axios from 'axios';
import { MOCK_BUSES, POPULAR_ROUTES } from '../data/mockData';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

// OBTBS Trip & Search Endpoints
export const tripApi = {
  searchTrips: async (params) => {
    try {
      const res = await apiClient.get('/trips', { params });
      return res.data?.data || [];
    } catch (err) {
      if (USE_MOCKS) return MOCK_BUSES;
      throw err;
    }
  },
  getTripById: async (tripId) => {
    const res = await apiClient.get(`/trips/${tripId}`);
    return res.data?.data;
  },
  getSeats: async (tripId) => {
    const res = await apiClient.get(`/trips/${tripId}/seats`);
    return res.data?.data;
  },
  lockSeats: async (tripId, seatNumbers) => {
    const res = await apiClient.post(`/trips/${tripId}/locks`, { seatNumbers });
    return res.data?.data;
  },
  releaseLocks: async (tripId, seatNumbers) => {
    const res = await apiClient.post(`/trips/${tripId}/locks/release`, { seatNumbers });
    return res.data?.data;
  },
};

// Buses Endpoints (Customer & Legacy support)
export const busApi = {
  getBuses: async (params) => {
    try {
      const res = await apiClient.get('/trips', { params });
      return res.data?.data || [];
    } catch {
      try {
        const res2 = await apiClient.get('/buses', { params });
        return res2.data?.data || [];
      } catch (err) {
        if (USE_MOCKS) return MOCK_BUSES;
        throw err;
      }
    }
  },
  getBusById: async (id) => {
    try {
      const res = await apiClient.get(`/trips/${id}`);
      return res.data?.data;
    } catch {
      try {
        const res2 = await apiClient.get(`/buses/${id}`);
        return res2.data?.data;
      } catch (err) {
        if (USE_MOCKS) return MOCK_BUSES.find((b) => b.id === id || b._id === id);
        throw err;
      }
    }
  },
};

// Seats Endpoints
export const seatApi = {
  getSeats: async (tripOrBusId, date) => {
    try {
      // First try trip seats
      const res = await apiClient.get(`/trips/${tripOrBusId}/seats`);
      return res.data?.data;
    } catch {
      // Fallback to legacy seat endpoint
      const res2 = await apiClient.get(`/seats/${tripOrBusId}`, { params: { date } });
      return res2.data?.data;
    }
  },
  holdSeats: async (tripId, journeyDate, seatNumbers) => {
    try {
      const res = await apiClient.post(`/trips/${tripId}/locks`, { seatNumbers });
      return res.data;
    } catch {
      const res2 = await apiClient.post('/seats/hold', { busId: tripId, journeyDate, seatNumbers });
      return res2.data;
    }
  },
  releaseSeats: async (tripId, journeyDate, seatNumbers) => {
    try {
      const res = await apiClient.post(`/trips/${tripId}/locks/release`, { seatNumbers });
      return res.data;
    } catch {
      const res2 = await apiClient.post('/seats/release', { busId: tripId, journeyDate, seatNumbers });
      return res2.data;
    }
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

// Payment Endpoints
export const paymentApi = {
  initiatePayment: async (bookingId) => {
    const res = await apiClient.post('/payments/initiate', { bookingId });
    return res.data?.data;
  },
  verifyPayment: async (paymentData) => {
    const res = await apiClient.post('/payments/verify', paymentData);
    return res.data?.data;
  },
};

// Ticket Endpoints
export const ticketApi = {
  getTicket: async (identifier) => {
    const res = await apiClient.get(`/tickets/${identifier}`);
    return res.data?.data;
  },
  downloadPdf: async (identifier) => {
    const res = await apiClient.get(`/tickets/${identifier}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `ticket-${identifier}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      'trips',
      'pricing',
    ];
    const errors = {};
    const values = await Promise.all(
      resources.map(async (resource) => {
        try {
          return await adminRequestData(apiClient.get(adminResourcePath(resource)));
        } catch (err) {
          errors[resource] = err?.response?.data?.message || err?.message || 'Failed to fetch';
          return null;
        }
      })
    );
    const result = Object.fromEntries(resources.map((resource, index) => [resource, values[index]]));
    result._errors = errors;
    return result;
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
  updateBusLayout: async (busId, layoutData) => {
    const res = await apiClient.put(`/admin/buses/${busId}/layout`, layoutData);
    return res.data?.data;
  },
  generateRecurringTrips: async (data) => {
    const res = await apiClient.post('/admin/trips/recurrence', data);
    return res.data;
  },
  adjustPassengerWallet: async (id, amount, reason) => {
    const res = await apiClient.patch(`/admin/passengers/${id}/wallet`, { amount, reason });
    return res.data;
  },
  changeBookingSeat: async (id, oldSeatNumber, newSeatNumber) => {
    const res = await apiClient.post(`/admin/bookings/${id}/change-seat`, { oldSeatNumber, newSeatNumber });
    return res.data;
  },
  getAuditLogs: async (params) => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data;
  },
  previewPricing: async (data) => {
    const res = await apiClient.post('/admin/pricing/preview', data);
    return res.data?.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// Destination Endpoints
export const destinationApi = {
  getDestinations: async (params) => {
    const res = await apiClient.get('/destinations', { params });
    return res.data?.data || [];
  },
  getDestination: async (id) => {
    const res = await apiClient.get(`/destinations/${id}`);
    return res.data?.data;
  },
  createDestination: async (data) => {
    const res = await apiClient.post('/destinations', data);
    return res.data?.data;
  },
  updateDestination: async (id, data) => {
    const res = await apiClient.put(`/destinations/${id}`, data);
    return res.data?.data;
  },
  deleteDestination: async (id) => {
    const res = await apiClient.delete(`/destinations/${id}`);
    return res.data?.data;
  },
};

// Travel Journal Endpoints
export const journalApi = {
  getMyJournal: async () => {
    const res = await apiClient.get('/journal');
    return res.data?.data || [];
  },
  createJournalEntry: async (data) => {
    const res = await apiClient.post('/journal', data);
    return res.data?.data;
  },
  deleteJournalEntry: async (id) => {
    const res = await apiClient.delete(`/journal/${id}`);
    return res.data?.data;
  },
};

// Saved Passengers Endpoints
export const savedPassengerApi = {
  getSavedPassengers: async () => {
    const res = await apiClient.get('/users/saved-passengers');
    return res.data?.data || [];
  },
  createSavedPassenger: async (data) => {
    const res = await apiClient.post('/users/saved-passengers', data);
    return res.data?.data;
  },
  deleteSavedPassenger: async (id) => {
    const res = await apiClient.delete(`/users/saved-passengers/${id}`);
    return res.data?.data;
  },
};

// Health API
export const healthApi = {
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
};

// Offer / Promo Endpoints
export const offerApi = {
  getOffers: async () => {
    try {
      const res = await apiClient.get('/offers');
      return res.data?.data || [];
    } catch {
      return [];
    }
  },
  validateOffer: async (data) => {
    const res = await apiClient.post('/offers/validate', data);
    return res.data;
  },
};

// Route Endpoints
export const routeApi = {
  getRoutes: async () => {
    try {
      const res = await apiClient.get('/routes');
      return res.data?.data || [];
    } catch (err) {
      if (USE_MOCKS) return POPULAR_ROUTES;
      throw err;
    }
  },
};

// Tour Packages & Circuits Endpoints
export const packageApi = {
  getPackages: async (params) => {
    try {
      const res = await apiClient.get('/packages', { params });
      return res.data?.data || [];
    } catch {
      return [];
    }
  },
  getPackage: async (slug) => {
    const res = await apiClient.get(`/packages/${slug}`);
    return res.data?.data;
  },
  getAdminPackages: async () => {
    const res = await apiClient.get('/packages/admin/all');
    return res.data?.data || [];
  },
  createPackage: async (data) => {
    const res = await apiClient.post('/packages/admin', data);
    return res.data?.data;
  },
  updatePackage: async (id, data) => {
    const res = await apiClient.put(`/packages/admin/${id}`, data);
    return res.data?.data;
  },
  deletePackage: async (id) => {
    const res = await apiClient.delete(`/packages/admin/${id}`);
    return res.data;
  },
};

export default apiClient;
