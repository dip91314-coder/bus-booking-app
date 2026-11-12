import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Ticket,
  Search,
  Eye,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Phone,
  Mail,
  Printer,
  Bus,
  MapPin,
  CreditCard,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookingManagementPage = () => {
  const { bookings, cancelBooking } = useAdmin();

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested refund');

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'ALL' && b.bookingStatus !== statusFilter) return false;
      if (paymentFilter !== 'ALL' && b.paymentStatus !== paymentFilter) return false;
      if (dateFilter && b.journeyDate !== dateFilter) return false;
      return true;
    });
  }, [bookings, statusFilter, paymentFilter, dateFilter]);

  const handleOpenCancel = (booking) => {
    setBookingToCancel(booking);
    setCancelReason('Customer requested cancellation & refund');
    setCancelConfirmOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Columns definition
  const columns = [
    {
      key: 'pnr',
      label: 'Booking PNR',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedBooking(row)}
          className="font-mono font-black text-primary hover:underline text-left"
          title="Click to view full e-ticket"
        >
          {row.pnr}
        </button>
      )
    },
    {
      key: 'passengerName',
      label: 'Passenger Details',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.passengerName}</span>
          <span className="text-[11px] text-slate-400 font-mono">{row.passengerPhone}</span>
        </div>
      )
    },
    {
      key: 'busName',
      label: 'Bus Details',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 block">{row.busName}</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {row.busNumber} • {row.operator}
          </span>
        </div>
      )
    },
    {
      key: 'source',
      label: 'Journey Route',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">
            <span>{row.source}</span>
            <span className="text-slate-400 mx-1">➔</span>
            <span>{row.destination}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.departureTime} - {row.arrivalTime}
          </span>
        </div>
      )
    },
    {
      key: 'journeyDate',
      label: 'Travel Date',
      render: (row) => (
        <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.journeyDate}
        </span>
      )
    },
    {
      key: 'seats',
      label: 'Seat Numbers',
      render: (row) => (
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {Array.isArray(row.seats) ? row.seats.join(', ') : row.seats}
        </span>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total Fare',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">
          ₹{row.totalAmount || row.fare}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
            row.paymentStatus === 'Paid'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.paymentStatus === 'Refunded'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : row.paymentStatus === 'Failed'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.paymentStatus}
        </span>
      )
    },
    {
      key: 'bookingStatus',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.bookingStatus === 'Confirmed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.bookingStatus === 'Completed'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : row.bookingStatus === 'Cancelled'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.bookingStatus}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedBooking(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition"
            title="View Booking Details & Ticket"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.bookingStatus !== 'Cancelled' && (
            <button
              type="button"
              onClick={() => handleOpenCancel(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
              title="Cancel Booking & Refund"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate__animated animate__fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Booking & Reservation Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit national PNR records, review passenger manifests, modify seat allocations, and initiate cancellations.
          </p>
        </div>
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Filters:</span>

        {/* Booking Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Booking Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Payment Status Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Refunded">Refunded</option>
          <option value="Failed">Failed</option>
        </select>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent border-none text-xs focus:ring-0 p-0 text-slate-700"
          />
        </div>

        {(statusFilter !== 'ALL' || paymentFilter !== 'ALL' || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setPaymentFilter('ALL');
              setDateFilter('');
            }}
            className="text-xs font-bold text-rose-600 hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredBookings}
        searchPlaceholder="Search PNR, passenger name, phone, operator..."
        searchKeys={['pnr', 'passengerName', 'passengerPhone', 'passengerEmail', 'operator', 'busName', 'source', 'destination']}
        exportFileName="passenger_bookings_audit"
      />

      {/* VIEW BOOKING MODAL */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Manifest: ${selectedBooking.pnr}`}
          subtitle={`Issued on ${new Date(selectedBooking.bookedAt).toLocaleString()}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs" id="printable-ticket-area">
            {/* Top Pass Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#071330] to-[#123E9B] text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                  Electronic Bus Ticket (e-Ticket)
                </span>
                <h3 className="text-xl font-black font-mono tracking-wider">
                  {selectedBooking.pnr}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  {selectedBooking.operator} • {selectedBooking.busName}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedBooking.bookingStatus === 'Confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  }`}
                >
                  {selectedBooking.bookingStatus.toUpperCase()}
                </span>
                <span className="block text-xs text-blue-200 mt-1 font-mono font-bold">
                  Seats: {Array.isArray(selectedBooking.seats) ? selectedBooking.seats.join(', ') : selectedBooking.seats}
                </span>
              </div>
            </div>

            {/* Journey Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Departure Details
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedBooking.source}</p>
                <p className="text-slate-600 font-mono">
                  Time: <strong>{selectedBooking.departureTime}</strong>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Date: <strong>{selectedBooking.journeyDate}</strong>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Arrival Details
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedBooking.destination}</p>
                <p className="text-slate-600 font-mono">
                  Time: <strong>{selectedBooking.arrivalTime}</strong> (Next morning)
                </p>
                <p className="text-slate-500 text-[11px]">
                  Bus Number: <strong className="font-mono">{selectedBooking.busNumber}</strong>
                </p>
              </div>
            </div>

            {/* Manifested Passenger List */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Manifested Passengers</h4>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-500 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Passenger Name</th>
                      <th className="py-2.5 px-3">Age & Gender</th>
                      <th className="py-2.5 px-3">Seat Number</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {selectedBooking.passengers && selectedBooking.passengers.length > 0 ? (
                      selectedBooking.passengers.map((p, i) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                          <td className="py-2.5 px-3 capitalize">
                            {p.age} yrs, {p.gender}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">{p.seat}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                            Allocated
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {selectedBooking.passengerName}
                        </td>
                        <td className="py-2.5 px-3">28 yrs, Adult</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">
                          {Array.isArray(selectedBooking.seats)
                            ? selectedBooking.seats.join(', ')
                            : selectedBooking.seats}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                          Allocated
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Payment Method
                </span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedBooking.paymentMethod}</p>
                <p className="text-[11px] text-slate-500">
                  Status:{' '}
                  <strong className="text-emerald-700">{selectedBooking.paymentStatus}</strong>
                </p>
              </div>
              <div className="sm:text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Total Fare Collected (incl. GST)
                </span>
                <span className="text-xl font-black text-primary font-sans">
                  ₹{selectedBooking.totalAmount || selectedBooking.fare}
                </span>
              </div>
            </div>

            {/* Action Bar in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print e-Ticket</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedBooking.bookingStatus !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = selectedBooking;
                      setSelectedBooking(null);
                      handleOpenCancel(b);
                    }}
                    className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                  >
                    Cancel Booking
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CANCEL BOOKING CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          if (bookingToCancel) {
            cancelBooking(bookingToCancel.id, cancelReason);
            setBookingToCancel(null);
          }
        }}
        title={`Cancel Booking PNR: ${bookingToCancel?.pnr}`}
        message={`Are you sure you want to cancel the reservation for ${bookingToCancel?.passengerName}? This will free up the allocated seat(s) and automatically initiate a refund of ₹${bookingToCancel?.totalAmount || bookingToCancel?.fare}.`}
        confirmText="Confirm Cancellation & Refund"
        type="danger"
      />
    </div>
  );
};

export default BookingManagementPage;
