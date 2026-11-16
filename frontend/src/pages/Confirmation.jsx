import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { ticketApi } from '../services/api';
import PrintableTicket from '../components/booking/PrintableTicket';
import { normalizeYatraFleetItem } from '../utils/yatraFleet';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Home, Ticket, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const Confirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings } = useBooking();
  const reduceMotion = useReducedMotion();

  const [remoteBooking, setRemoteBooking] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  useEffect(() => {
    let active = true;
    if (id && !bookings.find((b) => b.pnr === id || b.id === id)) {
      setLoadingTicket(true);
      ticketApi
        .getTicket(id)
        .then((ticketData) => {
          if (!active || !ticketData) return;
          const snap = ticketData.journeySnapshot || ticketData.journey || {};
          setRemoteBooking(normalizeYatraFleetItem({
            id: ticketData.pnr || ticketData._id,
            pnr: ticketData.pnr,
            busName: snap.busName,
            busNumber: snap.busNumber,
            operator: 'YatraBus',
            busType: snap.busType || 'AC Luxury Coach',
            origin: snap.source || snap.origin,
            destination: snap.destination,
            from_location: snap.from_location || snap.source || snap.origin,
            to_location: snap.to_location || snap.destination,
            journeyDate: snap.travelDate,
            departureTime: snap.departureTime,
            arrivalTime: snap.arrivalTime,
            boardingPoint: typeof snap.boardingPoint === 'string' ? snap.boardingPoint : snap.boardingPoint?.name || 'Main Boarding Terminal',
            droppingPoint: typeof snap.droppingPoint === 'string' ? snap.droppingPoint : snap.droppingPoint?.name || 'City Junction',
            pickup_point: snap.pickup_point || snap.boardingPoint || 'Main Boarding Terminal',
            drop_point: snap.drop_point || snap.droppingPoint || 'City Junction',
            latitude: snap.latitude,
            longitude: snap.longitude,
            seats: ticketData.seats || [],
            passengers: ticketData.passengerSnapshot || ticketData.passengers || [],
            totalFare: ticketData.priceBreakdown?.totalAmount || ticketData.pricing?.totalFare || 950,
            bookingStatus: ticketData.status || 'confirmed',
            paymentStatus: ticketData.paymentStatus || 'paid',
            paymentMethod: ticketData.paymentMethod || 'Online Gateway',
            bookedAt: ticketData.generatedAt || ticketData.issuedAt || new Date().toISOString()
          }));
        })
        .catch((err) => {
          console.warn('Could not fetch remote ticket:', err?.message);
        })
        .finally(() => {
          if (active) setLoadingTicket(false);
        });
    }

    return () => {
      active = false;
    };
  }, [id, bookings]);

  // Find booking by PNR or ID, or remote fallback, or first local
  const booking = bookings.find((b) => b.pnr === id || b.id === id) || remoteBooking || bookings[0];

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-card text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Ticket Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Could not retrieve booking details for reference {id}.
          </p>
          <Link
            to="/"
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-confirmation-page min-h-screen bg-white dark:bg-[#0B0F19] py-10 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Success Hero Notice */}
      <motion.div
        className="no-print max-w-3xl mx-auto mb-8 text-center space-y-2"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm"
          initial={reduceMotion ? false : { scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, type: 'spring', bounce: 0.45 }}
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment & Reservation Verified
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center justify-center gap-2">
          Booking Confirmed! Have a Pleasant Journey.
          <Sparkles className={`hidden sm:block h-5 w-5 text-amber-500 ${reduceMotion ? '' : 'animate-pulse'}`} aria-hidden="true" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Your digital ticket and SMS receipt are ready. Your seat is confirmed on a YatraBus coach.
        </p>
      </motion.div>

      {/* The Printable Boarding Pass */}
      <PrintableTicket booking={booking} />
    </div>
  );
};

export default Confirmation;

