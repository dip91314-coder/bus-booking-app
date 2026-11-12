import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  CalendarClock,
  Plus,
  Edit,
  Trash2,
  Bus,
  Milestone,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ScheduleManagementPage = () => {
  const { schedules, buses, routes, addSchedule, updateSchedule, deleteSchedule } = useAdmin();

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const defaultForm = {
    busId: buses[0]?.id || '',
    routeId: routes[0]?.id || '',
    journeyDate: today,
    departureTime: '20:00',
    arrivalTime: '06:30',
    fare: 950,
    availableSeats: 36,
    totalSeats: 36,
    status: 'Scheduled'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.busId) errs.busId = 'Please select a bus';
    if (!formData.routeId) errs.routeId = 'Please select a route';
    if (!formData.journeyDate) errs.journeyDate = 'Journey date is required';
    if (!formData.departureTime) errs.departureTime = 'Departure time is required';
    if (!formData.arrivalTime) errs.arrivalTime = 'Arrival time is required';
    if (!formData.fare || Number(formData.fare) <= 0) errs.fare = 'Price must be > 0';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    const firstBus = buses[0] || {};
    const firstRoute = routes[0] || {};
    setFormData({
      ...defaultForm,
      busId: firstBus.id || '',
      routeId: firstRoute.id || '',
      fare: firstBus.fare || 950,
      availableSeats: firstBus.capacity || 36,
      totalSeats: firstBus.capacity || 36
    });
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      busId: schedule.busId,
      routeId: schedule.routeId,
      journeyDate: schedule.journeyDate,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      fare: schedule.fare,
      availableSeats: schedule.availableSeats,
      totalSeats: schedule.totalSeats || 36,
      status: schedule.status
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDelete = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteConfirmOpen(true);
  };

  const handleBusChange = (busId) => {
    const bus = buses.find((b) => b.id === busId);
    setFormData((prev) => ({
      ...prev,
      busId,
      fare: bus ? bus.fare : prev.fare,
      availableSeats: bus ? bus.capacity : prev.availableSeats,
      totalSeats: bus ? bus.capacity : prev.totalSeats
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors.');
      return;
    }

    const bus = buses.find((b) => b.id === formData.busId);
    const route = routes.find((r) => r.id === formData.routeId);

    addSchedule({
      ...formData,
      busNumber: bus?.busNumber || 'N/A',
      busName: bus?.busName || 'Express Coach',
      source: route?.source || 'Origin',
      destination: route?.destination || 'Destination',
      fare: Number(formData.fare),
      availableSeats: Number(formData.availableSeats),
      totalSeats: Number(formData.totalSeats)
    });
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors.');
      return;
    }

    const bus = buses.find((b) => b.id === formData.busId);
    const route = routes.find((r) => r.id === formData.routeId);

    updateSchedule(selectedSchedule.id, {
      ...formData,
      busNumber: bus?.busNumber || selectedSchedule.busNumber,
      busName: bus?.busName || selectedSchedule.busName,
      source: route?.source || selectedSchedule.source,
      destination: route?.destination || selectedSchedule.destination,
      fare: Number(formData.fare),
      availableSeats: Number(formData.availableSeats),
      totalSeats: Number(formData.totalSeats)
    });
    setEditModalOpen(false);
  };

  // Columns definition
  const columns = [
    {
      key: 'id',
      label: 'Schedule ID',
      render: (row) => <span className="font-mono font-bold text-primary">{row.id}</span>
    },
    {
      key: 'busName',
      label: 'Assigned Bus',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.busName}</span>
          <span className="font-mono text-xs text-primary">{row.busNumber}</span>
        </div>
      )
    },
    {
      key: 'source',
      label: 'Assigned Route',
      render: (row) => (
        <div className="font-semibold text-slate-800">
          <span>{row.source}</span>
          <span className="text-slate-400 mx-1.5">➔</span>
          <span>{row.destination}</span>
        </div>
      )
    },
    {
      key: 'journeyDate',
      label: 'Journey Date & Timings',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.journeyDate}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {row.departureTime} - {row.arrivalTime}
          </span>
        </div>
      )
    },
    {
      key: 'fare',
      label: 'Ticket Price',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">₹{row.fare}</span>
      )
    },
    {
      key: 'availableSeats',
      label: 'Seat Availability',
      render: (row) => {
        const total = row.totalSeats || 36;
        const available = row.availableSeats !== undefined ? row.availableSeats : 15;
        const booked = total - available;
        const pct = Math.round((booked / total) * 100);

        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-emerald-700">{available} Left</span>
              <span className="text-slate-400 font-normal">{total} total</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${
                  pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'Scheduled'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : row.status === 'On Route'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'Completed'
              ? 'bg-slate-100 text-slate-700 border border-slate-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status === 'On Route' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          )}
          {row.status}
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
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title="Edit Schedule"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Cancel / Delete Schedule"
          >
            <Trash2 className="w-4 h-4" />
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
            Schedule & Trip Dispatch Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pair registered coaches with travel routes, set calendar dates, departure intervals, and dynamic fare rates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Schedule</span>
        </button>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={schedules}
        searchPlaceholder="Search by schedule ID, bus name, city..."
        searchKeys={['id', 'busName', 'busNumber', 'source', 'destination', 'journeyDate']}
        exportFileName="bus_trip_schedules"
      />

      {/* ADD SCHEDULE MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Publish Bus Schedule"
        subtitle="Schedule a bus journey on an active transit route."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Select Bus Coach *
            </label>
            <select
              value={formData.busId}
              onChange={(e) => handleBusChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} — {b.operator} ({b.busName}) [{b.capacity} Seats]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Select Route Corridor *
            </label>
            <select
              value={formData.routeId}
              onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.source} ➔ {r.destination} ({r.distance}, {r.duration})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Journey Date *</label>
              <input
                type="date"
                value={formData.journeyDate}
                onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Departure *</label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Arrival *</label>
              <input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Ticket Price (₹) *
              </label>
              <input
                type="number"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-bold text-primary border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Available Seats *
              </label>
              <input
                type="number"
                value={formData.availableSeats}
                onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Trip Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="On Route">On Route</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm"
            >
              Publish Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SCHEDULE MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Schedule: ${selectedSchedule?.id}`}
        subtitle="Modify departure times, pricing or trip status."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Journey Date *</label>
              <input
                type="date"
                value={formData.journeyDate}
                onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Departure *</label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Arrival *</label>
              <input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Ticket Price (₹) *
              </label>
              <input
                type="number"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-bold text-primary border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Available Seats *
              </label>
              <input
                type="number"
                value={formData.availableSeats}
                onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Trip Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="On Route">On Route</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
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
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (scheduleToDelete) {
            deleteSchedule(scheduleToDelete.id);
            setScheduleToDelete(null);
          }
        }}
        title="Remove Schedule"
        message={`Are you sure you want to cancel and remove schedule ${scheduleToDelete?.id} (${scheduleToDelete?.source} ➔ ${scheduleToDelete?.destination})?`}
        confirmText="Yes, Remove Schedule"
      />
    </div>
  );
};

export default ScheduleManagementPage;
