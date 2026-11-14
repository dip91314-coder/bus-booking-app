import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_BUSES, INITIAL_USER_BOOKINGS, INITIAL_SAVED_TRAVELLERS } from '../data/mockData';
import toast from 'react-hot-toast';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  // Bus inventory
  const [buses, setBuses] = useState(() => {
    try {
      const saved = localStorage.getItem('yatra_buses');
      return saved ? JSON.parse(saved) : MOCK_BUSES;
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
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState(null);
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState(null);
  const [passengers, setPassengers] = useState([]);

  // User Bookings History
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('yatra_bookings');
      return saved ? JSON.parse(saved) : INITIAL_USER_BOOKINGS;
    } catch {
      return INITIAL_USER_BOOKINGS;
    }
  });

  // Saved Travellers
  const [savedTravellers, setSavedTravellers] = useState(() => {
    try {
      const saved = localStorage.getItem('yatra_travellers');
      return saved ? JSON.parse(saved) : INITIAL_SAVED_TRAVELLERS;
    } catch {
      return INITIAL_SAVED_TRAVELLERS;
    }
  });

  // Sync to local storage
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
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('yatra_bookings', JSON.stringify(bookings));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('yatra_travellers', JSON.stringify(savedTravellers));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [savedTravellers]);

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
  const confirmBooking = ({ paymentMethod, contactEmail, contactPhone }) => {
    if (!selectedBus || selectedSeats.length === 0) {
      toast.error('No active booking details found.');
      return null;
    }

    // Generate unique PNR
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pnr = `BK-${randomHex}`;

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
      journeyDate: searchParams.journeyDate || today,
      departureTime: selectedBus.departureTime,
      arrivalTime: selectedBus.arrivalTime,
      boardingPoint: selectedBoardingPoint ? selectedBoardingPoint.name : (selectedBus.boardingPoints?.[0]?.name || 'Central Bus Station'),
      droppingPoint: selectedDroppingPoint ? selectedDroppingPoint.name : (selectedBus.droppingPoints?.[0]?.name || 'City Drop Terminal'),
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
            availableSeatsCount: Math.max(0, (bus.availableSeatsCount || 15) - selectedSeats.length),
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

    return newBooking;
  };

  // Cancel booking
  const cancelBooking = (pnr) => {
    setBookings((prev) =>
      prev.map((b) => (b.pnr === pnr ? { ...b, bookingStatus: 'cancelled' } : b))
    );
    toast.success(`Booking ${pnr} has been cancelled successfully. Refund initiated.`);
  };

  // Saved Travellers
  const addSavedTraveller = (traveller) => {
    const newTraveller = {
      ...traveller,
      id: `st-${Date.now()}`
    };
    setSavedTravellers((prev) => [newTraveller, ...prev]);
    toast.success(`${traveller.name} added to Saved Travellers.`);
  };

  const deleteSavedTraveller = (id) => {
    setSavedTravellers((prev) => prev.filter((t) => t.id !== id));
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
        selectedSeats,
        toggleSeat,
        clearSeats,
        selectedBoardingPoint,
        setSelectedBoardingPoint,
        selectedDroppingPoint,
        setSelectedDroppingPoint,
        passengers,
        setPassengers,
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
