import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import PrintableTicket from '../components/booking/PrintableTicket';
import { CheckCircle2, Home, Ticket, Sparkles, AlertCircle } from 'lucide-react';

const Confirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings } = useBooking();

  // Find booking by PNR or ID
  const booking = bookings.find((b) => b.pnr === id || b.id === id) || bookings[0];

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
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] py-10 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Success Hero Notice */}
      <div className="no-print max-w-3xl mx-auto mb-8 text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment & Reservation Verified
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Booking Confirmed! Have a Pleasant Journey.
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          We have dispatched your verified digital ticket and SMS receipt. Your seat is confirmed with the bus fleet operator.
        </p>
      </div>

      {/* The Printable Boarding Pass */}
      <PrintableTicket booking={booking} />
    </div>
  );
};

export default Confirmation;

