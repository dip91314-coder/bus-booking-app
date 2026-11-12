import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Users,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Ticket,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const PassengerManagementPage = () => {
  const { passengers, updatePassenger, togglePassengerStatus, bookings } = useAdmin();

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [passengerToToggle, setPassengerToToggle] = useState(null);

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  });

  // Filtered list
  const filteredPassengers = useMemo(() => {
    return passengers.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      return true;
    });
  }, [passengers, statusFilter]);

  const handleOpenEdit = (passenger) => {
    setSelectedPassenger(passenger);
    setEditFormData({
      name: passenger.name,
      email: passenger.email,
      phone: passenger.phone,
      city: passenger.city || ''
    });
    setEditModalOpen(true);
  };

  const handleOpenToggleStatus = (passenger) => {
    setPassengerToToggle(passenger);
    setStatusConfirmOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    updatePassenger(selectedPassenger.id, editFormData);
    setEditModalOpen(false);
  };

  // Find bookings for selected passenger
  const passengerBookings = useMemo(() => {
    if (!selectedPassenger) return [];
    return bookings.filter(
      (b) =>
        b.passengerName?.toLowerCase() === selectedPassenger.name.toLowerCase() ||
        b.passengerEmail?.toLowerCase() === selectedPassenger.email.toLowerCase()
    );
  }, [selectedPassenger, bookings]);

  // Columns definition
  const columns = [
    {
      key: 'name',
      label: 'Passenger Profile',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {row.id}</span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact Details',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Mail className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-xs">{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Phone className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-[11px]">{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'city',
      label: 'Base City',
      render: (row) => (
        <div className="flex items-center gap-1 text-slate-700 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.city || 'India'}</span>
        </div>
      )
    },
    {
      key: 'totalBookings',
      label: 'Bookings',
      render: (row) => (
        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.totalBookings} trips
        </span>
      )
    },
    {
      key: 'totalSpent',
      label: 'Total Spend',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">
          ₹{row.totalSpent?.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Account Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status === 'Active' ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <UserX className="w-3 h-3 text-rose-600" />
          )}
          {row.status}
        </span>
      )
    },
    {
      key: 'joinedDate',
      label: 'Registered Date',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.joinedDate}</span>
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
            onClick={() => setSelectedPassenger(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition"
            title="View Passenger Profile & Booking History"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title="Edit Passenger Info"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenToggleStatus(row)}
            className={`p-1.5 rounded-lg transition ${
              row.status === 'Active'
                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
          >
            {row.status === 'Active' ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
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
            Passenger Directory & Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access registered customer contact records, lifetime travel frequency, and account security controls.
          </p>
        </div>
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Passenger Accounts</option>
          <option value="Active">Active Accounts</option>
          <option value="Suspended">Suspended Accounts</option>
        </select>

        {statusFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="text-xs font-bold text-rose-600 hover:underline ml-auto"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredPassengers}
        searchPlaceholder="Search passenger name, email, phone, city..."
        searchKeys={['name', 'email', 'phone', 'city', 'id']}
        exportFileName="passenger_directory"
      />

      {/* VIEW PASSENGER PROFILE MODAL */}
      {selectedPassenger && !editModalOpen && (
        <Modal
          isOpen={!!selectedPassenger}
          onClose={() => setSelectedPassenger(null)}
          title={`Passenger Profile: ${selectedPassenger.name}`}
          subtitle={`Registered since ${selectedPassenger.joinedDate}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Top Info Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-lg font-black flex items-center justify-center shadow-md">
                  {selectedPassenger.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedPassenger.name}</h3>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedPassenger.email}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedPassenger.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedPassenger.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedPassenger.status}
                </span>
                <span className="block text-slate-400 text-[10px] mt-1">
                  Location: {selectedPassenger.city}
                </span>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Total Bookings
                </span>
                <span className="text-xl font-black text-slate-900">
                  {selectedPassenger.totalBookings} Completed
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Lifetime Value
                </span>
                <span className="text-xl font-black text-primary font-mono">
                  ₹{selectedPassenger.totalSpent?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Frequent Routes */}
            {selectedPassenger.frequentRoutes && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Preferred Corridors</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPassenger.frequentRoutes.map((r, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 text-primary border border-blue-200 font-semibold"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Booking History Audit */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Booking History on Platform</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] border-b">
                    <tr>
                      <th className="py-2 px-3">PNR</th>
                      <th className="py-2 px-3">Route</th>
                      <th className="py-2 px-3">Travel Date</th>
                      <th className="py-2 px-3">Seats</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {passengerBookings.length > 0 ? (
                      passengerBookings.map((b) => (
                        <tr key={b.id}>
                          <td className="py-2 px-3 font-mono font-bold text-primary">{b.pnr}</td>
                          <td className="py-2 px-3">
                            {b.source} ➔ {b.destination}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px]">{b.journeyDate}</td>
                          <td className="py-2 px-3 font-bold text-blue-600">
                            {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}
                          </td>
                          <td className="py-2 px-3 font-bold font-sans">
                            ₹{b.totalAmount || b.fare}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {b.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">
                          No recent bookings recorded for this passenger.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPassenger(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT PASSENGER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Passenger Information"
        subtitle={`Update profile details for ${selectedPassenger?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">City / Region</label>
            <input
              type="text"
              value={editFormData.city}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* TOGGLE STATUS CONFIRM */}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        onConfirm={() => {
          if (passengerToToggle) {
            togglePassengerStatus(passengerToToggle.id);
            setPassengerToToggle(null);
          }
        }}
        title={`${passengerToToggle?.status === 'Active' ? 'Suspend' : 'Activate'} Passenger Account`}
        message={`Are you sure you want to ${
          passengerToToggle?.status === 'Active' ? 'suspend' : 're-activate'
        } the account for ${passengerToToggle?.name}? ${
          passengerToToggle?.status === 'Active'
            ? 'The customer will not be able to book tickets until re-activated.'
            : 'The customer will immediately regain full ticket reservation capabilities.'
        }`}
        confirmText={`Yes, ${passengerToToggle?.status === 'Active' ? 'Suspend' : 'Activate'}`}
        type={passengerToToggle?.status === 'Active' ? 'danger' : 'info'}
      />
    </div>
  );
};

export default PassengerManagementPage;
