import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  CheckCircle2,
  Printer,
  Download,
  Share2,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  QrCode,
  Home,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const PrintableTicket = ({ booking }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Preparing ticket PDF download...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Bus Ticket PNR ${booking.pnr}`,
        text: `My YatraBus booking from ${booking.origin} to ${booking.destination} is confirmed! PNR: ${booking.pnr}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ticket link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Action buttons (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-primary bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
          >
            <UserCheck className="w-4 h-4" /> My Bookings
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold text-primary bg-blue-50 hover:bg-primary hover:text-white px-4 py-2 rounded-xl border border-blue-200 transition"
          >
            <Printer className="w-4 h-4" /> Print Ticket
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-accent hover:bg-accent-hover px-4 py-2 rounded-xl shadow-md transition"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Actual Printable Ticket Stub */}
      <div
        id="printable-ticket"
        className="bg-white rounded-3xl shadow-elevated border border-gray-200 overflow-hidden relative"
      >
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-primary to-[#0C247A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Bus className="w-7 h-7 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  Yatra<span className="text-accent">Bus</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Confirmed
                </span>
              </div>
              <p className="text-xs text-blue-200">Official Digital Boarding Pass & Tax Invoice</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <span className="text-[11px] text-blue-200 block uppercase tracking-wider font-semibold">
              Booking Reference (PNR)
            </span>
            <span className="text-xl sm:text-2xl font-black text-accent tracking-wider font-mono">
              {booking.pnr}
            </span>
          </div>
        </div>

        {/* Perforated ticket cut line effect */}
        <div className="relative border-b-2 border-dashed border-gray-200">
          <div className="w-6 h-6 rounded-full bg-[#F8FAFD] border-r-2 border-gray-200 absolute -left-3 -top-3"></div>
          <div className="w-6 h-6 rounded-full bg-[#F8FAFD] border-l-2 border-gray-200 absolute -right-3 -top-3"></div>
        </div>

        {/* Journey Route & Operator Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Origin</span>
              <h4 className="text-xl font-black text-gray-900">{booking.origin}</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {booking.departureTime} • {booking.journeyDate}
              </p>
              <p className="text-[11px] text-gray-500 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{booking.boardingPoint}</span>
              </p>
            </div>

            <div className="text-center flex flex-col items-center">
              <span className="text-xs font-bold text-primary mb-1">Direct Transit</span>
              <div className="w-full flex items-center justify-center relative">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <div className="h-0.5 bg-gradient-to-r from-primary to-accent flex-1 mx-2"></div>
                <Bus className="w-4 h-4 text-accent absolute top-1/2 -translate-y-1/2" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 font-semibold">
                Bus: {booking.busNumber}
              </span>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Destination</span>
              <h4 className="text-xl font-black text-gray-900">{booking.destination}</h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {booking.arrivalTime} • Next Day
              </p>
              <p className="text-[11px] text-gray-500 mt-1 flex items-start md:justify-end gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span>{booking.droppingPoint}</span>
              </p>
            </div>
          </div>

          {/* Bus Service & Seats summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Bus Operator</span>
              <span className="font-extrabold text-gray-900 text-sm">{booking.operator}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Bus Class</span>
              <span className="font-bold text-gray-800">{booking.busType}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Seats Allocated</span>
              <span className="font-black text-emerald-700 text-sm">
                {booking.seats?.join(', ')} ({booking.seats?.length} Seats)
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Total Fare Paid</span>
              <span className="font-black text-primary text-base font-sans">
                ₹{booking.totalFare}
              </span>
            </div>
          </div>

          {/* Passenger Roster Table */}
          <div>
            <h5 className="font-black text-gray-900 text-xs uppercase tracking-wider mb-3">
              Passenger Manifest
            </h5>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">#</th>
                    <th className="py-2.5 px-4 font-bold">Passenger Name</th>
                    <th className="py-2.5 px-4 font-bold">Age</th>
                    <th className="py-2.5 px-4 font-bold">Gender</th>
                    <th className="py-2.5 px-4 font-bold">Seat No.</th>
                    <th className="py-2.5 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {booking.passengers?.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-semibold text-gray-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold">{p.name}</td>
                      <td className="py-2.5 px-4">{p.age} yrs</td>
                      <td className="py-2.5 px-4 capitalize">{p.gender}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-primary">{p.seatNumber}</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-600">Confirmed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & QR Code */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Simulated Payment Verified ({booking.paymentMethod})</span>
              </div>
              <p>Booking Timestamp: {new Date(booking.bookedAt || Date.now()).toLocaleString()}</p>
              <p className="text-[11px] text-gray-400">
                Please carry a valid Govt. Photo ID card during boarding for conductor verification.
              </p>
            </div>

            {/* Simulated QR Code */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center shrink-0">
              <QrCode className="w-16 h-16 text-gray-800" />
              <span className="text-[9px] font-mono text-gray-500 mt-1 uppercase">Scan for Gate Pass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableTicket;
