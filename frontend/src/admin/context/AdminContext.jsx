import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_BUSES,
  INITIAL_ROUTES,
  INITIAL_SCHEDULES,
  INITIAL_BOOKINGS,
  INITIAL_PASSENGERS,
  INITIAL_DRIVERS,
  INITIAL_STAFF,
  INITIAL_PAYMENTS,
  INITIAL_OFFERS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS
} from '../data/mockAdminData';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  // Helper to load and save to localStorage
  const loadState = (key, fallback) => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return fallback;
      const saved = localStorage.getItem(`bb_admin_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // 1. Buses State
  const [buses, setBuses] = useState(() => loadState('buses', INITIAL_BUSES));
  // 2. Routes State
  const [routes, setRoutes] = useState(() => loadState('routes', INITIAL_ROUTES));
  // 3. Schedules State
  const [schedules, setSchedules] = useState(() => loadState('schedules', INITIAL_SCHEDULES));
  // 4. Bookings State
  const [bookings, setBookings] = useState(() => loadState('bookings', INITIAL_BOOKINGS));
  // 5. Passengers State
  const [passengers, setPassengers] = useState(() => loadState('passengers', INITIAL_PASSENGERS));
  // 6. Drivers State
  const [drivers, setDrivers] = useState(() => loadState('drivers', INITIAL_DRIVERS));
  // 7. Staff State
  const [staff, setStaff] = useState(() => loadState('staff', INITIAL_STAFF));
  // 8. Payments State
  const [payments, setPayments] = useState(() => loadState('payments', INITIAL_PAYMENTS));
  // 9. Offers State
  const [offers, setOffers] = useState(() => loadState('offers', INITIAL_OFFERS));
  // 10. Reviews State
  const [reviews, setReviews] = useState(() => loadState('reviews', INITIAL_REVIEWS));
  // 11. Notifications State
  const [notifications, setNotifications] = useState(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  // 12. Settings State
  const [settings, setSettings] = useState(() => loadState('settings', INITIAL_SETTINGS));

  // Sync states to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_buses', JSON.stringify(buses));
    }
  }, [buses]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_routes', JSON.stringify(routes));
    }
  }, [routes]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_schedules', JSON.stringify(schedules));
    }
  }, [schedules]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_passengers', JSON.stringify(passengers));
    }
  }, [passengers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_drivers', JSON.stringify(drivers));
    }
  }, [drivers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_staff', JSON.stringify(staff));
    }
  }, [staff]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_payments', JSON.stringify(payments));
    }
  }, [payments]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_offers', JSON.stringify(offers));
    }
  }, [offers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_reviews', JSON.stringify(reviews));
    }
  }, [reviews]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('bb_admin_settings', JSON.stringify(settings));
    }
  }, [settings]);

  // ================= BUS MANAGEMENT ACTIONS =================
  const addBus = (busData) => {
    const newBus = {
      ...busData,
      id: `BUS-${Date.now().toString().slice(-4)}`,
      rating: busData.rating || 4.5,
      lastServiceDate: new Date().toISOString().split('T')[0]
    };
    setBuses((prev) => [newBus, ...prev]);
    toast.success(`Bus ${newBus.busNumber} added successfully to fleet!`);
    return newBus;
  };

  const updateBus = (id, updatedData) => {
    setBuses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b)));
    toast.success('Bus details updated successfully.');
  };

  const deleteBus = (id) => {
    const busToDelete = buses.find((b) => b.id === id);
    setBuses((prev) => prev.filter((b) => b.id !== id));
    toast.success(`Bus ${busToDelete?.busNumber || id} removed from fleet.`);
  };

  // ================= ROUTE MANAGEMENT ACTIONS =================
  const addRoute = (routeData) => {
    const newRoute = {
      ...routeData,
      id: `RT-${Date.now().toString().slice(-3)}`,
      activeBusesCount: Number(routeData.activeBusesCount) || 10,
      status: routeData.status || 'Active'
    };
    setRoutes((prev) => [newRoute, ...prev]);
    toast.success(`Route ${newRoute.source} ➔ ${newRoute.destination} added.`);
    return newRoute;
  };

  const updateRoute = (id, updatedData) => {
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r)));
    toast.success('Route details updated successfully.');
  };

  const deleteRoute = (id) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    toast.success('Route removed successfully.');
  };

  // ================= SCHEDULE MANAGEMENT ACTIONS =================
  const addSchedule = (scheduleData) => {
    const newSchedule = {
      ...scheduleData,
      id: `SCH-${Date.now().toString().slice(-3)}`,
      status: scheduleData.status || 'Scheduled'
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    toast.success('New bus schedule published successfully.');
    return newSchedule;
  };

  const updateSchedule = (id, updatedData) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    toast.success('Schedule updated.');
  };

  const deleteSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    toast.success('Schedule deleted.');
  };

  // ================= BOOKING MANAGEMENT ACTIONS =================
  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      bookedAt: new Date().toISOString()
    };
    newBooking.pnr = newBooking.id;
    setBookings((prev) => [newBooking, ...prev]);
    toast.success(`Booking ${newBooking.pnr} created.`);
    return newBooking;
  };

  const updateBooking = (id, updatedData) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b)));
    toast.success('Booking updated.');
  };

  const cancelBooking = (id, reason = 'Administrative cancellation') => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, bookingStatus: 'Cancelled', paymentStatus: 'Refunded', cancelReason: reason } : b
      )
    );
    // Also record refund in payments if not already
    setPayments((prev) =>
      prev.map((p) => (p.bookingId === id ? { ...p, refundStatus: 'Processed' } : p))
    );
    // Add notification
    addNotification({
      title: 'Booking Cancelled',
      message: `Booking ${id} was cancelled. Refund processed automatically.`,
      category: 'cancellation'
    });
    toast.success(`Booking ${id} has been cancelled and marked for refund.`);
  };

  // ================= PASSENGER MANAGEMENT ACTIONS =================
  const updatePassenger = (id, updatedData) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
    toast.success('Passenger profile updated.');
  };

  const togglePassengerStatus = (id) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'Active' ? 'Suspended' : 'Active';
          toast.success(`Passenger account marked as ${nextStatus}.`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // ================= DRIVER MANAGEMENT ACTIONS =================
  const addDriver = (driverData) => {
    const newDriver = {
      ...driverData,
      id: `DRV-${Date.now().toString().slice(-3)}`,
      rating: 4.8,
      tripsCompleted: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setDrivers((prev) => [newDriver, ...prev]);
    toast.success(`Driver ${newDriver.name} registered.`);
    return newDriver;
  };

  const updateDriver = (id, updatedData) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updatedData } : d)));
    toast.success('Driver information updated.');
  };

  const deleteDriver = (id) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    toast.success('Driver profile removed.');
  };

  // ================= STAFF MANAGEMENT ACTIONS =================
  const addStaff = (staffData) => {
    const newStaff = {
      ...staffData,
      id: `STF-${Date.now().toString().slice(-3)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setStaff((prev) => [newStaff, ...prev]);
    toast.success(`Staff member ${newStaff.name} added.`);
    return newStaff;
  };

  const updateStaff = (id, updatedData) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    toast.success('Staff details updated.');
  };

  const deleteStaff = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.success('Staff member removed.');
  };

  // ================= PAYMENT MANAGEMENT ACTIONS =================
  const processRefund = (txnId) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === txnId) {
          toast.success(`Refund for transaction ${txnId} of ₹${p.amount} successfully processed.`);
          return { ...p, refundStatus: 'Processed' };
        }
        return p;
      })
    );
  };

  // ================= OFFERS & DISCOUNTS ACTIONS =================
  const addOffer = (offerData) => {
    const newOffer = {
      ...offerData,
      id: `OFF-${Date.now().toString().slice(-3)}`,
      usageCount: 0,
      status: 'Active'
    };
    setOffers((prev) => [newOffer, ...prev]);
    toast.success(`Coupon code ${newOffer.code} created.`);
    return newOffer;
  };

  const updateOffer = (id, updatedData) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updatedData } : o)));
    toast.success('Offer coupon updated.');
  };

  const toggleOfferStatus = (id) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const next = o.status === 'Active' ? 'Disabled' : 'Active';
          toast.success(`Offer ${o.code} is now ${next}.`);
          return { ...o, status: next };
        }
        return o;
      })
    );
  };

  const deleteOffer = (id) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    toast.success('Offer coupon deleted.');
  };

  // ================= REVIEWS & FEEDBACK ACTIONS =================
  const updateReviewStatus = (id, newStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast.success(`Review status set to ${newStatus}.`);
  };

  const deleteReview = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success('Review removed.');
  };

  // ================= NOTIFICATIONS ACTIONS =================
  const addNotification = (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      time: 'Just now',
      read: false,
      ...notif
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // ================= SETTINGS ACTIONS =================
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    toast.success('Platform configuration saved successfully.');
  };

  const changePassword = (currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
      toast.error('Please enter both current and new passwords.');
      return false;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return false;
    }
    toast.success('Admin password updated successfully!');
    return true;
  };

  // ================= DERIVED GLOBAL METRICS =================
  const metrics = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.bookingStatus !== 'Cancelled')
      .reduce((acc, curr) => acc + (curr.totalAmount || curr.fare || 0), 0);

    const pendingBookingsCount = bookings.filter((b) => b.bookingStatus === 'Pending').length;
    const activeBusesCount = buses.filter((b) => b.status === 'Active').length;
    const activeRoutesCount = routes.filter((r) => r.status === 'Active').length;
    const totalPassengersCount = passengers.length;

    return {
      totalRevenue: totalRevenue + 18450000, // adding base demonstration gross volume
      totalBookings: bookings.length + 14820,
      totalPassengers: totalPassengersCount + 8420,
      totalBuses: buses.length,
      activeBuses: activeBusesCount,
      activeRoutes: activeRoutesCount,
      pendingBookings: pendingBookingsCount,
      occupancyRate: '88.5%'
    };
  }, [bookings, buses, routes, passengers]);

  return (
    <AdminContext.Provider
      value={{
        // Metrics
        metrics,
        // Buses
        buses,
        addBus,
        updateBus,
        deleteBus,
        // Routes
        routes,
        addRoute,
        updateRoute,
        deleteRoute,
        // Schedules
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        // Bookings
        bookings,
        addBooking,
        updateBooking,
        cancelBooking,
        // Passengers
        passengers,
        updatePassenger,
        togglePassengerStatus,
        // Drivers
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        // Staff
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        // Payments
        payments,
        processRefund,
        // Offers
        offers,
        addOffer,
        updateOffer,
        toggleOfferStatus,
        deleteOffer,
        // Reviews
        reviews,
        updateReviewStatus,
        deleteReview,
        // Notifications
        notifications,
        unreadNotificationsCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
        // Settings
        settings,
        updateSettings,
        changePassword
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
