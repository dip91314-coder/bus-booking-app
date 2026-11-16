import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_BUSES, INITIAL_USER_BOOKINGS, INITIAL_SAVED_TRAVELLERS } from '../data/mockData';
import { normalizeYatraFleetItems } from '../utils/yatraFleet';
import { bookingApi, savedPassengerApi } from '../services/api';
import toast from 'react-hot-toast';
import { useNotifications } from './NotificationContext';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Bus inventory
  const [buses, setBuses] = useState(() => {
    try {
      const saved = localStorage.getItem('yatra_buses');
      return saved ? normalizeYatraFleetItems(JSON.parse(saved)) : MOCK_BUSES;
    } catch {
      return MOCK_BUSES;
    }
  });

  // Search Criteria
  const today = new Date().toISOString().split('T')[0];
  const [searchParams, setSearchParams] = useState({
    origin: 'Kolkata',
    destination: 'Siliguri',
    journeyDate: today,
    returnDate: ''
  });

  // Active Booking Flow State
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null); // full trip object from search results
  const [tripId, setTripId] = useState(null); // tripId used throughout booking flow
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockExpiry, setLockExpiry] = useState(null); // timestamp when seat locks expire
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState(null);
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [bookingId, setBookingId] = useState(null); // set after createBooking
  const [pnr, setPnr] = useState(null); // set after createBooking

  // User Bookings History: empty by default for all real new users
  const [bookings, setBookings] = useState(() => {
    try {
      if (typeof window === 'undefined') return [];
      const savedUserStr = localStorage.getItem('yatra_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (!savedUser) return [];
      const isDemo = savedUser.email?.toLowerCase() === 'rahul@yatra.com';
      if (isDemo) {
        const saved = localStorage.getItem('yatra_bookings_demo');
        return saved ? normalizeYatraFleetItems(JSON.parse(saved)) : INITIAL_USER_BOOKINGS;
      }
      const uid = savedUser.id || savedUser._id || savedUser.email;
      const saved = localStorage.getItem(`yatra_bookings_${uid}`);
      return saved ? normalizeYatraFleetItems(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  // Saved Travellers: empty by default for all real new users
  const [savedTravellers, setSavedTravellers] = useState(() => {
    try {
      if (typeof window === 'undefined') return [];
      const savedUserStr = localStorage.getItem('yatra_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (!savedUser) return [];
      const isDemo = savedUser.email?.toLowerCase() === 'rahul@yatra.com';
      if (isDemo) {
        const saved = localStorage.getItem('yatra_travellers_demo');
        return saved ? JSON.parse(saved) : INITIAL_SAVED_TRAVELLERS;
      }
      const uid = savedUser.id || savedUser._id || savedUser.email;
      const saved = localStorage.getItem(`yatra_travellers_${uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load real user bookings and saved passengers from API
  const refreshUserBookings = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('yatrabus_token') : null;
    if (!token) return;
    try {
      const liveBookings = await bookingApi.getMyBookings();
      if (Array.isArray(liveBookings)) {
        setBookings(normalizeYatraFleetItems(liveBookings));
      }
    } catch (err) {
      console.warn('Could not load user bookings from API:', err?.message);
    }
  }, []);

  const refreshSavedPassengers = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('yatrabus_token') : null;
    if (!token) return;
    try {
      const list = await savedPassengerApi.getSavedPassengers();
      if (Array.isArray(list)) {
        setSavedTravellers(list.map((p) => ({ ...p, id: p._id || p.id })));
      }
    } catch (err) {
      console.warn('Could not load saved passengers from API:', err?.message);
    }
  }, []);

  // Sync state whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setSavedTravellers([]);
      return;
    }
    const isDemo = user.email?.toLowerCase() === 'rahul@yatra.com';
    const uid = user.id || user._id || user.email;
    const bKey = isDemo ? 'yatra_bookings_demo' : `yatra_bookings_${uid}`;
    const tKey = isDemo ? 'yatra_travellers_demo' : `yatra_travellers_${uid}`;

    try {
      const savedB = localStorage.getItem(bKey);
      if (savedB) {
        setBookings(normalizeYatraFleetItems(JSON.parse(savedB)));
      } else {
        setBookings(isDemo ? INITIAL_USER_BOOKINGS : []);
      }

      const savedT = localStorage.getItem(tKey);
      if (savedT) {
        setSavedTravellers(JSON.parse(savedT));
      } else {
        setSavedTravellers(isDemo ? INITIAL_SAVED_TRAVELLERS : []);
      }
    } catch {
      setBookings(isDemo ? INITIAL_USER_BOOKINGS : []);
      setSavedTravellers(isDemo ? INITIAL_SAVED_TRAVELLERS : []);
    }

    refreshUserBookings();
    refreshSavedPassengers();
  }, [user, refreshUserBookings, refreshSavedPassengers]);

  // Sync to local storage scoped to user
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('yatra_buses', JSON.stringify(buses));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [buses]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && user) {
        const isDemo = user.email?.toLowerCase() === 'rahul@yatra.com';
        const uid = user.id || user._id || user.email;
        const bKey = isDemo ? 'yatra_bookings_demo' : `yatra_bookings_${uid}`;
        localStorage.setItem(bKey, JSON.stringify(bookings));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [bookings, user]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && user) {
        const isDemo = user.email?.toLowerCase() === 'rahul@yatra.com';
        const uid = user.id || user._id || user.email;
        const tKey = isDemo ? 'yatra_travellers_demo' : `yatra_travellers_${uid}`;
        localStorage.setItem(tKey, JSON.stringify(savedTravellers));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [savedTravellers, user]);

  // Seat toggle logic with 6-seat cap
  const toggleSeat = (seat) => {
    const seatNum = seat.seatNumber || seat.number;
    const isAlreadySelected = selectedSeats.some(
      (s) => (s.seatNumber || s.number) === seatNum
    );

    if (isAlreadySelected) {
      setSelectedSeats((prev) => prev.filter((s) => (s.seatNumber || s.number) !== seatNum));
    } else {
      if (selectedSeats.length >= 6) {
        toast.error('You can select a maximum of 6 seats per booking transaction.', {
          icon: '⚠️'
        });
        return;
      }
      setSelectedSeats((prev) => [...prev, { ...seat, number: seatNum, seatNumber: seatNum }]);
    }
  };

  const clearSeats = () => {
    setSelectedSeats([]);
  };

  // Reset booking funnel state
  const resetBookingFlow = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setSelectedBoardingPoint(null);
    setSelectedDroppingPoint(null);
    setPassengers([]);
  };

  // Confirm booking
  const confirmBooking = ({ paymentMethod, contactEmail, contactPhone, bookingReference }) => {
    if (!selectedBus || selectedSeats.length === 0) {
      toast.error('No active booking details found.');
      return null;
    }

    // Generate unique PNR
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pnr = bookingReference || `BK-${randomHex}`;

    const totalFare = selectedSeats.reduce((acc, curr) => acc + (curr.price || selectedBus.fare), 0);
    const taxAndGst = Math.round(totalFare * 0.05); // 5% GST

    const newBooking = {
      id: pnr,
      pnr,
      busId: selectedBus.id,
      busName: selectedBus.busName,
      operator: selectedBus.operator,
      busNumber: selectedBus.busNumber,
      busType: selectedBus.busType,
      origin: selectedBus.origin,
      destination: selectedBus.destination,
      from_location: selectedBus.origin || searchParams.origin,
      to_location: selectedBus.destination || searchParams.destination,
      journeyDate: searchParams.journeyDate || today,
      departureTime: selectedBus.departureTime,
      arrivalTime: selectedBus.arrivalTime,
      boardingPoint: selectedBoardingPoint ? selectedBoardingPoint.name : (selectedBus.boardingPoints?.[0]?.name || 'Central Bus Station'),
      droppingPoint: selectedDroppingPoint ? selectedDroppingPoint.name : (selectedBus.droppingPoints?.[0]?.name || 'City Drop Terminal'),
      pickup_point: selectedBoardingPoint?.name || selectedBus.boardingPoints?.[0]?.name || 'Central Bus Station',
      drop_point: selectedDroppingPoint?.name || selectedBus.droppingPoints?.[0]?.name || 'City Drop Terminal',
      latitude: selectedBoardingPoint?.latitude ?? null,
      longitude: selectedBoardingPoint?.longitude ?? null,
      seats: selectedSeats.map((s) => s.seatNumber || s.number),
      passengers: passengers.length > 0 ? passengers : selectedSeats.map((s, idx) => ({
        name: `Passenger ${idx + 1}`,
        age: 25,
        gender: 'male',
        seatNumber: s.seatNumber || s.number
      })),
      totalFare: totalFare + taxAndGst,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'UPI Simulated',
      contactEmail,
      contactPhone,
      bookedAt: new Date().toISOString()
    };

    // Update bus seat status in master list to booked
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.id === selectedBus.id && bus.seats) {
          const updatedLower = bus.seats.lower?.map((seat) =>
            selectedSeats.some((s) => s.number === seat.number) ? { ...seat, status: 'booked' } : seat
          ) || [];
          const updatedUpper = bus.seats.upper?.map((seat) =>
            selectedSeats.some((s) => s.number === seat.number) ? { ...seat, status: 'booked' } : seat
          ) || [];

          return {
            ...bus,
            availableSeatsCount: Math.max(
              0,
              Number(bus.availableSeatsCount ?? bus.availableSeats ?? 15) - selectedSeats.length
            ),
            seats: {
              ...bus.seats,
              lower: updatedLower,
              upper: updatedUpper
            }
          };
        }
        return bus;
      })
    );

    // Save to user bookings
    setBookings((prev) => [newBooking, ...prev]);
    addNotification({
      title: 'New booking created',
      message: `Booking ${pnr} for ${newBooking.from_location} to ${newBooking.to_location} is confirmed.`,
      type: 'booking'
    });

    return newBooking;
  };

  // Cancel booking
  const cancelBooking = (pnr) => {
    setBookings((prev) =>
      prev.map((b) => (b.pnr === pnr ? { ...b, bookingStatus: 'cancelled' } : b))
    );
    addNotification({
      title: 'Booking cancelled',
      message: `Booking ${pnr} was cancelled. Your refund has been initiated.`,
      type: 'cancellation'
    });
    toast.success(`Booking ${pnr} has been cancelled successfully. Refund initiated.`);
  };

  // Saved Travellers
  const addSavedTraveller = async (traveller) => {
    try {
      const created = await savedPassengerApi.createPassenger(traveller);
      const newTraveller = created ? { ...created, id: created._id || created.id } : {
        ...traveller,
        id: `st-${Date.now()}`
      };
      setSavedTravellers((prev) => [newTraveller, ...prev]);
      toast.success(`${traveller.name} added to Saved Travellers.`);
      return newTraveller;
    } catch {
      const fallback = {
        ...traveller,
        id: `st-${Date.now()}`
      };
      setSavedTravellers((prev) => [fallback, ...prev]);
      toast.success(`${traveller.name} added to Saved Travellers.`);
      return fallback;
    }
  };

  const deleteSavedTraveller = async (id) => {
    try {
      if (id && !String(id).startsWith('st-')) {
        await savedPassengerApi.deletePassenger(id);
      }
    } catch (err) {
      console.warn('Could not delete passenger on server:', err?.message);
    }
    setSavedTravellers((prev) => prev.filter((t) => t.id !== id && t._id !== id));
    toast.success('Traveller removed from saved list.');
  };

  // Admin Fleet Management
  const addBus = (newBusData) => {
    const newBus = {
      ...newBusData,
      id: `BUS-${Date.now()}`,
      rating: 4.8,
      reviewsCount: 1,
      availableSeatsCount: newBusData.totalSeats || 36,
      seats: {
        lower: Array.from({ length: 18 }, (_, i) => ({
          number: `L${i + 1}`,
          type: i % 3 === 0 ? 'single' : 'double',
          deck: 'lower',
          price: Number(newBusData.fare) || 999,
          status: 'available',
          isLadies: false
        })),
        upper: Array.from({ length: 18 }, (_, i) => ({
          number: `U${i + 1}`,
          type: i % 3 === 0 ? 'single' : 'double',
          deck: 'upper',
          price: (Number(newBusData.fare) || 999) + 100,
          status: 'available',
          isLadies: false
        }))
      }
    };
    setBuses((prev) => [newBus, ...prev]);
    toast.success(`Bus ${newBus.busName} added to active fleet!`);
  };

  const updateBus = (busId, updatedFields) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, ...updatedFields } : b))
    );
    toast.success('Bus details updated successfully.');
  };

  const deleteBus = (busId) => {
    setBuses((prev) => prev.filter((b) => b.id !== busId));
    toast.success('Bus removed from active schedules.');
  };

  return (
    <BookingContext.Provider
      value={{
        buses,
        searchParams,
        setSearchParams,
        selectedBus,
        setSelectedBus,
        selectedTrip,
        setSelectedTrip,
        tripId,
        setTripId,
        selectedSeats,
        setSelectedSeats,
        toggleSeat,
        clearSeats,
        lockExpiry,
        setLockExpiry,
        selectedBoardingPoint,
        setSelectedBoardingPoint,
        selectedDroppingPoint,
        setSelectedDroppingPoint,
        passengers,
        setPassengers,
        bookingId,
        setBookingId,
        pnr,
        setPnr,
        bookings,
        confirmBooking,
        cancelBooking,
        savedTravellers,
        addSavedTraveller,
        deleteSavedTraveller,
        resetBookingFlow,
        addBus,
        updateBus,
        deleteBus
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
