import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
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

const hasAdminSession = () => {
  try {
    const user = JSON.parse(localStorage.getItem('yatra_user') || 'null');
    return Boolean(localStorage.getItem('yatrabus_token') && user?.role === 'admin');
  } catch {
    return false;
  }
};

const getAdminErrorMessage = (error) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  error.message ||
  'The admin request failed.';

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

  useEffect(() => {
    if (!hasAdminSession()) return undefined;

    let active = true;
    adminApi.getManagementData()
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.buses) && data.buses.length > 0) setBuses(data.buses);
        if (Array.isArray(data.routes) && data.routes.length > 0) setRoutes(data.routes);
        if (Array.isArray(data.schedules) && data.schedules.length > 0) setSchedules(data.schedules);
        if (Array.isArray(data.bookings) && data.bookings.length > 0) setBookings(data.bookings);
        if (Array.isArray(data.passengers) && data.passengers.length > 0) setPassengers(data.passengers);
        if (Array.isArray(data.drivers) && data.drivers.length > 0) setDrivers(data.drivers);
        if (Array.isArray(data.staff) && data.staff.length > 0) setStaff(data.staff);
        if (Array.isArray(data.payments) && data.payments.length > 0) setPayments(data.payments);
        if (Array.isArray(data.offers) && data.offers.length > 0) setOffers(data.offers);
        if (Array.isArray(data.reviews) && data.reviews.length > 0) setReviews(data.reviews);
        if (Array.isArray(data.notifications) && data.notifications.length > 0) setNotifications(data.notifications);
        if (data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0) {
          setSettings(data.settings);
        }
      })
      .catch((error) => {
        console.warn('Admin management data sync note:', getAdminErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, []);

  const runAdminRequest = (request, onSuccess, fallback, successMessage) => {
    if (!hasAdminSession()) return fallback();
    return request()
      .then((data) => {
        onSuccess(data);
        if (successMessage) toast.success(successMessage);
        return data;
      })
      .catch((error) => {
        toast.error(getAdminErrorMessage(error));
        return null;
      });
  };

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
    return runAdminRequest(
      () => adminApi.createResource('buses', busData),
      (newBus) => setBuses((prev) => [newBus, ...prev]),
      () => {
        const newBus = {
          ...busData,
          id: `BUS-${Date.now().toString().slice(-4)}`,
          rating: busData.rating || 4.5,
          lastServiceDate: new Date().toISOString().split('T')[0]
        };
        setBuses((prev) => [newBus, ...prev]);
        toast.success(`Bus ${newBus.busNumber} added successfully to fleet!`);
        return newBus;
      },
      `Bus ${busData.busNumber} added successfully to fleet!`
    );
  };

  const updateBus = (id, updatedData) => {
    return runAdminRequest(
      () => adminApi.updateResource('buses', id, updatedData),
      (bus) => setBuses((prev) => prev.map((item) => (item.id === id ? bus : item))),
      () => {
        setBuses((prev) => prev.map((bus) => (bus.id === id ? { ...bus, ...updatedData } : bus)));
        toast.success('Bus details updated successfully.');
      },
      'Bus details updated successfully.'
    );
  };

  const deleteBus = (id) => {
    const busToDelete = buses.find((bus) => bus.id === id);
    return runAdminRequest(
      () => adminApi.deleteResource('buses', id),
      () => setBuses((prev) => prev.filter((bus) => bus.id !== id)),
      () => {
        setBuses((prev) => prev.filter((bus) => bus.id !== id));
        toast.success(`Bus ${busToDelete?.busNumber || id} removed from fleet.`);
      },
      `Bus ${busToDelete?.busNumber || id} removed from fleet.`
    );
  };

  // ================= ROUTE MANAGEMENT ACTIONS =================
  const addRoute = (routeData) => {
    return runAdminRequest(
      () => adminApi.createResource('routes', routeData),
      (route) => setRoutes((prev) => [route, ...prev]),
      () => {
        const newRoute = {
          ...routeData,
          id: `RT-${Date.now().toString().slice(-3)}`,
          activeBusesCount: Number(routeData.activeBusesCount) || 10,
          status: routeData.status || 'Active'
        };
        setRoutes((prev) => [newRoute, ...prev]);
        toast.success(`Route ${newRoute.source} ➔ ${newRoute.destination} added.`);
        return newRoute;
      },
      `Route ${routeData.source} ➔ ${routeData.destination} added.`
    );
  };

  const updateRoute = (id, updatedData) => {
    return runAdminRequest(
      () => adminApi.updateResource('routes', id, updatedData),
      (route) => setRoutes((prev) => prev.map((item) => (item.id === id ? route : item))),
      () => {
        setRoutes((prev) => prev.map((route) => (route.id === id ? { ...route, ...updatedData } : route)));
        toast.success('Route details updated successfully.');
      },
      'Route details updated successfully.'
    );
  };

  const deleteRoute = (id) => {
    return runAdminRequest(
      () => adminApi.deleteResource('routes', id),
      () => setRoutes((prev) => prev.filter((route) => route.id !== id)),
      () => {
        setRoutes((prev) => prev.filter((route) => route.id !== id));
        toast.success('Route removed successfully.');
      },
      'Route removed successfully.'
    );
  };

  // ================= SCHEDULE MANAGEMENT ACTIONS =================
  const addSchedule = (scheduleData) => {
    return runAdminRequest(
      () => adminApi.createResource('schedules', scheduleData),
      (schedule) => setSchedules((prev) => [schedule, ...prev]),
      () => {
        const newSchedule = {
          ...scheduleData,
          id: `SCH-${Date.now().toString().slice(-3)}`,
          status: scheduleData.status || 'Scheduled'
        };
        setSchedules((prev) => [newSchedule, ...prev]);
        toast.success('New bus schedule published successfully.');
        return newSchedule;
      },
      'New bus schedule published successfully.'
    );
  };

  const updateSchedule = (id, updatedData) => {
    return runAdminRequest(
      () => adminApi.updateResource('schedules', id, updatedData),
      (schedule) => setSchedules((prev) => prev.map((item) => (item.id === id ? schedule : item))),
      () => {
        setSchedules((prev) => prev.map((schedule) => (schedule.id === id ? { ...schedule, ...updatedData } : schedule)));
        toast.success('Schedule updated.');
      },
      'Schedule updated.'
    );
  };

  const deleteSchedule = (id) => {
    return runAdminRequest(
      () => adminApi.deleteResource('schedules', id),
      () => setSchedules((prev) => prev.filter((schedule) => schedule.id !== id)),
      () => {
        setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
        toast.success('Schedule deleted.');
      },
      'Schedule deleted.'
    );
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
    const applyCancellation = (booking) => {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === id || item.pnr === id
            ? { ...item, ...booking, bookingStatus: 'Cancelled', paymentStatus: 'Refunded', cancelReason: reason }
            : item
        )
      );
      setPayments((prev) =>
        prev.map((payment) =>
          payment.bookingId === id || payment.bookingId === booking?.pnr
            ? { ...payment, status: 'Refunded', refundStatus: 'Processed' }
            : payment
        )
      );
      addNotification({
        title: 'Booking Cancelled',
        message: `Booking ${id} was cancelled. Refund processed automatically.`,
        category: 'cancellation'
      });
    };

    return runAdminRequest(
      () => adminApi.cancelBooking(id, reason),
      applyCancellation,
      () => {
        applyCancellation({ id, pnr: id });
        toast.success(`Booking ${id} has been cancelled and marked for refund.`);
      },
      `Booking ${id} has been cancelled and marked for refund.`
    );
  };

  // ================= PASSENGER MANAGEMENT ACTIONS =================
  const updatePassenger = (id, updatedData) => {
    return runAdminRequest(
      () => adminApi.updateResource('passengers', id, updatedData),
      (passenger) => setPassengers((prev) => prev.map((item) => (item.id === id ? { ...item, ...passenger } : item))),
      () => {
        setPassengers((prev) => prev.map((passenger) => (passenger.id === id ? { ...passenger, ...updatedData } : passenger)));
        toast.success('Passenger profile updated.');
      },
      'Passenger profile updated.'
    );
  };

  const togglePassengerStatus = (id) => {
    const applyStatus = (status) => {
      setPassengers((prev) =>
        prev.map((passenger) =>
          passenger.id === id
            ? { ...passenger, status: status || (passenger.status === 'Active' ? 'Suspended' : 'Active') }
            : passenger
        )
      );
    };
    const passenger = passengers.find((item) => item.id === id);
    return runAdminRequest(
      () => adminApi.togglePassengerStatus(id),
      (result) => {
        applyStatus(result.status);
        toast.success(`Passenger account marked as ${result.status}.`);
      },
      () => {
        const nextStatus = passenger?.status === 'Active' ? 'Suspended' : 'Active';
        applyStatus(nextStatus);
        toast.success(`Passenger account marked as ${nextStatus}.`);
      }
    );
  };

  // ================= DRIVER MANAGEMENT ACTIONS =================
  const addDriver = (driverData) => {
    return runAdminRequest(
      () => adminApi.createResource('drivers', driverData),
      (driver) => setDrivers((prev) => [driver, ...prev]),
      () => {
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
      },
      `Driver ${driverData.name} registered.`
    );
  };

  const updateDriver = (id, updatedData) => {
    return runAdminRequest(
      () => adminApi.updateResource('drivers', id, updatedData),
      (driver) => setDrivers((prev) => prev.map((item) => (item.id === id ? driver : item))),
      () => {
        setDrivers((prev) => prev.map((driver) => (driver.id === id ? { ...driver, ...updatedData } : driver)));
        toast.success('Driver information updated.');
      },
      'Driver information updated.'
    );
  };

  const deleteDriver = (id) => {
    return runAdminRequest(
      () => adminApi.deleteResource('drivers', id),
      () => setDrivers((prev) => prev.filter((driver) => driver.id !== id)),
      () => {
        setDrivers((prev) => prev.filter((driver) => driver.id !== id));
        toast.success('Driver profile removed.');
      },
      'Driver profile removed.'
    );
  };

  // ================= STAFF MANAGEMENT ACTIONS =================
  const addStaff = (staffData) => {
    return runAdminRequest(
      () => adminApi.createResource('staff', staffData),
      (member) => setStaff((prev) => [member, ...prev]),
      () => {
        const newStaff = {
          ...staffData,
          id: `STF-${Date.now().toString().slice(-3)}`,
          joinedDate: new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        setStaff((prev) => [newStaff, ...prev]);
        toast.success(`Staff member ${newStaff.name} added.`);
        return newStaff;
      },
      `Staff member ${staffData.name} added.`
    );
  };

  const updateStaff = (id, updatedData) => {
    return runAdminRequest(
      () => adminApi.updateResource('staff', id, updatedData),
      (member) => setStaff((prev) => prev.map((item) => (item.id === id ? member : item))),
      () => {
        setStaff((prev) => prev.map((member) => (member.id === id ? { ...member, ...updatedData } : member)));
        toast.success('Staff details updated.');
      },
      'Staff details updated.'
    );
  };

  const deleteStaff = (id) => {
    return runAdminRequest(
      () => adminApi.deleteResource('staff', id),
      () => setStaff((prev) => prev.filter((member) => member.id !== id)),
      () => {
        setStaff((prev) => prev.filter((member) => member.id !== id));
        toast.success('Staff member removed.');
      },
      'Staff member removed.'
    );
  };

  // ================= PAYMENT MANAGEMENT ACTIONS =================
  const processRefund = (txnId) => {
    const updatePayment = () => {
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === txnId
            ? { ...payment, status: 'Refunded', refundStatus: 'Processed' }
            : payment
        )
      );
    };
    const payment = payments.find((item) => item.id === txnId);
    return runAdminRequest(
      () => adminApi.refundPayment(txnId),
      updatePayment,
      () => {
        updatePayment();
        toast.success(`Refund for transaction ${txnId} of ₹${payment?.amount || 0} successfully processed.`);
      },
      `Refund for transaction ${txnId} of ₹${payment?.amount || 0} successfully processed.`
    );
  };

  // ================= OFFERS & DISCOUNTS ACTIONS =================
  const addOffer = (offerData) => {
    return runAdminRequest(
      () => adminApi.createResource('offers', offerData),
      (offer) => setOffers((prev) => [offer, ...prev]),
      () => {
        const newOffer = {
          ...offerData,
          id: `OFF-${Date.now().toString().slice(-3)}`,
          usageCount: 0,
          status: 'Active'
        };
        setOffers((prev) => [newOffer, ...prev]);
        toast.success(`Coupon code ${newOffer.code} created.`);
        return newOffer;
      },
      `Coupon code ${offerData.code} created.`
    );
  };

  const updateOffer = (id, updatedData) => {
    return runAdminRequest(
      () => adminApi.updateResource('offers', id, updatedData),
      (offer) => setOffers((prev) => prev.map((item) => (item.id === id ? offer : item))),
      () => {
        setOffers((prev) => prev.map((offer) => (offer.id === id ? { ...offer, ...updatedData } : offer)));
        toast.success('Offer coupon updated.');
      },
      'Offer coupon updated.'
    );
  };

  const toggleOfferStatus = (id) => {
    const offer = offers.find((item) => item.id === id);
    const nextStatus = offer?.status === 'Active' ? 'Disabled' : 'Active';
    return runAdminRequest(
      () => adminApi.updateResource('offers', id, { status: nextStatus }),
      (updatedOffer) => setOffers((prev) => prev.map((item) => (item.id === id ? updatedOffer : item))),
      () => {
        setOffers((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
        toast.success(`Offer ${offer?.code || id} is now ${nextStatus}.`);
      },
      `Offer ${offer?.code || id} is now ${nextStatus}.`
    );
  };

  const deleteOffer = (id) => {
    return runAdminRequest(
      () => adminApi.deleteResource('offers', id),
      () => setOffers((prev) => prev.filter((offer) => offer.id !== id)),
      () => {
        setOffers((prev) => prev.filter((offer) => offer.id !== id));
        toast.success('Offer coupon deleted.');
      },
      'Offer coupon deleted.'
    );
  };

  // ================= REVIEWS & FEEDBACK ACTIONS =================
  const updateReviewStatus = (id, newStatus) => {
    return runAdminRequest(
      () => adminApi.updateReviewStatus(id, newStatus),
      (review) => setReviews((prev) => prev.map((item) => (item.id === id ? review : item))),
      () => {
        setReviews((prev) => prev.map((review) => (review.id === id ? { ...review, status: newStatus } : review)));
        toast.success(`Review status set to ${newStatus}.`);
      },
      `Review status set to ${newStatus}.`
    );
  };

  const deleteReview = (id) => {
    return runAdminRequest(
      () => adminApi.deleteResource('reviews', id),
      () => setReviews((prev) => prev.filter((review) => review.id !== id)),
      () => {
        setReviews((prev) => prev.filter((review) => review.id !== id));
        toast.success('Review removed.');
      },
      'Review removed.'
    );
  };

  // ================= NOTIFICATIONS ACTIONS =================
  const addNotification = (notif) => {
    return runAdminRequest(
      () => adminApi.createResource('notifications', notif),
      (notification) => setNotifications((prev) => [notification, ...prev]),
      () => {
        const newNotif = {
          id: `NOTIF-${Date.now()}`,
          time: 'Just now',
          read: false,
          ...notif
        };
        setNotifications((prev) => [newNotif, ...prev]);
        return newNotif;
      }
    );
  };

  const markAsRead = (id) => {
    return runAdminRequest(
      () => adminApi.markNotificationRead(id),
      (notification) => setNotifications((prev) => prev.map((item) => (item.id === id ? notification : item))),
      () => setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)))
    );
  };

  const markAllAsRead = () => {
    return runAdminRequest(
      () => adminApi.markAllNotificationsRead(),
      () => setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true }))),
      () => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
        toast.success('All notifications marked as read.');
      },
      'All notifications marked as read.'
    );
  };

  const deleteNotification = (id) => {
    return runAdminRequest(
      () => adminApi.deleteResource('notifications', id),
      () => setNotifications((prev) => prev.filter((notification) => notification.id !== id)),
      () => setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    );
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // ================= SETTINGS ACTIONS =================
  const updateSettings = (newSettings) => {
    return runAdminRequest(
      () => adminApi.updateSettings(newSettings),
      (savedSettings) => setSettings((prev) => ({ ...prev, ...savedSettings })),
      () => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
        toast.success('Platform configuration saved successfully.');
      },
      'Platform configuration saved successfully.'
    );
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
    if (!hasAdminSession()) {
      toast.success('Admin password updated successfully!');
      return true;
    }

    return adminApi.changePassword(currentPassword, newPassword)
      .then(() => {
        toast.success('Admin password updated successfully!');
        return true;
      })
      .catch((error) => {
        toast.error(getAdminErrorMessage(error));
        return false;
      });
  };

  // ================= DERIVED GLOBAL METRICS =================
  const metrics = useMemo(() => {
    const totalRevenue = bookings
      .filter((booking) =>
        booking.bookingStatus?.toLowerCase() !== 'cancelled' &&
        booking.paymentStatus?.toLowerCase() !== 'refunded'
      )
      .reduce((acc, booking) => acc + (booking.totalAmount || booking.fare || 0), 0);

    const pendingBookingsCount = bookings.filter((booking) => booking.bookingStatus?.toLowerCase() === 'pending').length;
    const activeBusesCount = buses.filter((b) => b.status === 'Active').length;
    const activeRoutesCount = routes.filter((r) => r.status === 'Active').length;
    const totalPassengersCount = passengers.length;
    const totalSeats = schedules.reduce((total, schedule) => total + Number(schedule.totalSeats || 0), 0);
    const availableSeats = schedules.reduce((total, schedule) => total + Number(schedule.availableSeats || 0), 0);
    const occupancy = totalSeats
      ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100)
      : 0;

    return {
      totalRevenue,
      totalBookings: bookings.length,
      totalPassengers: totalPassengersCount,
      totalBuses: buses.length,
      activeBuses: activeBusesCount,
      activeRoutes: activeRoutesCount,
      pendingBookings: pendingBookingsCount,
      occupancyRate: `${occupancy}%`
    };
  }, [bookings, buses, routes, passengers, schedules]);

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
