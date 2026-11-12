import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Bus,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Wrench,
  XCircle,
  Wifi,
  Zap,
  Navigation,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_AMENITIES = [
  'AC',
  'WiFi',
  'Charging Point',
  'Blanket',
  'Water Bottle',
  'Reading Light',
  'Live GPS',
  'CCTV',
  'Movie Screen',
  'First Aid Kit',
  'Emergency Exit'
];

const OPERATORS_LIST = [
  'Greenline Express',
  'Royal Cruiser',
  'VRL Travels',
  'Zingbus Intercity',
  'SRS Travels',
  'Orange Tours & Travels',
  'IntrCity SmartBus',
  'Himalayan Golden Bus'
];

const BUS_TYPES_LIST = [
  'AC Sleeper (2+1)',
  'Multi-Axle AC Seater (2+2)',
  'AC Seater (2+2)',
  'Non-AC Seater (2+2)'
];

const BusManagementPage = () => {
  const { buses, addBus, updateBus, deleteBus } = useAdmin();

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [acFilter, setAcFilter] = useState('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedBus, setSelectedBus] = useState(null);
  const [busToDelete, setBusToDelete] = useState(null);

  // Form State
  const defaultFormState = {
    busNumber: '',
    busName: '',
    operator: 'Greenline Express',
    busType: 'AC Sleeper (2+1)',
    isAc: true,
    capacity: 36,
    fare: 950,
    origin: 'Kolkata',
    destination: 'Siliguri',
    departureTime: '20:00',
    arrivalTime: '06:30',
    status: 'Active',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Live GPS', 'Water Bottle']
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [formErrors, setFormErrors] = useState({});

  // Filtered Buses
  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      if (typeFilter !== 'ALL' && b.busType !== typeFilter) return false;
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (acFilter !== 'ALL') {
        const isAcBool = acFilter === 'AC';
        if (b.isAc !== isAcBool) return false;
      }
      return true;
    });
  }, [buses, typeFilter, statusFilter, acFilter]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.busNumber.trim()) errors.busNumber = 'Bus Number is required';
    if (!formData.busName.trim()) errors.busName = 'Bus Name is required';
    if (!formData.capacity || Number(formData.capacity) <= 0) errors.capacity = 'Capacity must be > 0';
    if (!formData.fare || Number(formData.fare) <= 0) errors.fare = 'Fare must be > 0';
    if (!formData.origin.trim()) errors.origin = 'Origin city is required';
    if (!formData.destination.trim()) errors.destination = 'Destination is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultFormState);
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleOpenEdit = (bus) => {
    setSelectedBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      busName: bus.busName,
      operator: bus.operator,
      busType: bus.busType,
      isAc: bus.isAc,
      capacity: bus.capacity,
      fare: bus.fare,
      origin: bus.origin,
      destination: bus.destination,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      status: bus.status,
      amenities: bus.amenities || []
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenView = (bus) => {
    setSelectedBus(bus);
    setViewModalOpen(true);
  };

  const handleOpenDelete = (bus) => {
    setBusToDelete(bus);
    setDeleteConfirmOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors.');
      return;
    }

    addBus({
      ...formData,
      capacity: Number(formData.capacity),
      fare: Number(formData.fare)
    });
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors.');
      return;
    }

    updateBus(selectedBus.id, {
      ...formData,
      capacity: Number(formData.capacity),
      fare: Number(formData.fare)
    });
    setEditModalOpen(false);
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  // Table Columns
  const columns = [
    {
      key: 'busNumber',
      label: 'Bus Number',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-primary block">{row.busNumber}</span>
          <span className="text-[10px] text-slate-400">ID: {row.id}</span>
        </div>
      )
    },
    {
      key: 'busName',
      label: 'Operator & Bus Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.operator}</span>
          <span className="text-[11px] text-slate-500">{row.busName}</span>
        </div>
      )
    },
    {
      key: 'busType',
      label: 'Type & Cooling',
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
            {row.busType}
          </span>
          <div>
            <span
              className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                row.isAc
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}
            >
              {row.isAc ? '❄️ AC Coach' : 'Non-AC'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      label: 'Seat Capacity',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">{row.capacity} Seats</span>
        </div>
      )
    },
    {
      key: 'origin',
      label: 'Default Corridor',
      render: (row) => (
        <div className="text-slate-700 font-medium">
          <span>{row.origin}</span>
          <span className="text-slate-400 mx-1">➔</span>
          <span>{row.destination}</span>
        </div>
      )
    },
    {
      key: 'fare',
      label: 'Base Fare',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">
          ₹{row.fare}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Availability',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'Maintenance'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {row.status === 'Active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          {row.status === 'Maintenance' && <Wrench className="w-3 h-3 text-amber-600" />}
          {row.status === 'Inactive' && <XCircle className="w-3 h-3 text-slate-500" />}
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
            onClick={() => handleOpenView(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title="Edit Bus"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Bus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate__animated animate__fadeIn">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bus Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure vehicle specs, capacity, climate class, assigned routes, and operational readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus</span>
        </button>
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Filters:</span>

        {/* Bus Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Bus Types</option>
          {BUS_TYPES_LIST.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* AC / Non-AC Filter */}
        <select
          value={acFilter}
          onChange={(e) => setAcFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Climate Types</option>
          <option value="AC">AC Coaches</option>
          <option value="Non-AC">Non-AC Coaches</option>
        </select>

        {/* Availability Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>

        {(typeFilter !== 'ALL' || statusFilter !== 'ALL' || acFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setTypeFilter('ALL');
              setStatusFilter('ALL');
              setAcFilter('ALL');
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
        data={filteredBuses}
        searchPlaceholder="Search by bus number, operator, name, city..."
        searchKeys={['busNumber', 'busName', 'operator', 'origin', 'destination', 'busType']}
        exportFileName="bus_fleet_inventory"
      />

      {/* ADD BUS MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Bus Coach"
        subtitle="Add a new luxury or express coach to the national booking system."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Registration / Bus Number *
              </label>
              <input
                type="text"
                placeholder="e.g. DL-01-TC-9988"
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-mono ${
                  formErrors.busNumber ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.busNumber && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.busNumber}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Bus Name / Fleet Label *
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Cruiser Multi-Axle"
                value={formData.busName}
                onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.busName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.busName && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.busName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Fleet Operator *
              </label>
              <select
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {OPERATORS_LIST.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Bus Type Category *
              </label>
              <select
                value={formData.busType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    busType: e.target.value,
                    isAc: !e.target.value.includes('Non-AC')
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {BUS_TYPES_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Seat Capacity *
              </label>
              <input
                type="number"
                min="10"
                max="60"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.capacity ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Base Fare (₹) *
              </label>
              <input
                type="number"
                min="100"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-bold text-primary ${
                  formErrors.fare ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Origin City *</label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                placeholder="e.g. Kolkata"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Destination City *
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                placeholder="e.g. Siliguri"
              />
            </div>
          </div>

          {/* Amenities Multi-Check */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">
              Onboard Amenities & Equipment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {ALL_AMENITIES.map((amenity) => {
                const checked = formData.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded text-primary focus:ring-0"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
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
              Register Bus to Fleet
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT BUS MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Bus: ${selectedBus?.busNumber}`}
        subtitle="Update coach specifications and operational status."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Registration / Bus Number *
              </label>
              <input
                type="text"
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-mono border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Bus Name / Fleet Label *
              </label>
              <input
                type="text"
                value={formData.busName}
                onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Fleet Operator *
              </label>
              <select
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {OPERATORS_LIST.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Bus Type Category *
              </label>
              <select
                value={formData.busType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    busType: e.target.value,
                    isAc: !e.target.value.includes('Non-AC')
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {BUS_TYPES_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Seat Capacity *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Base Fare (₹) *
              </label>
              <input
                type="number"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-bold text-primary border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">
              Amenities & Equipment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {ALL_AMENITIES.map((amenity) => {
                const checked = formData.amenities?.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded text-primary focus:ring-0"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
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
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW BUS DETAILS MODAL */}
      {selectedBus && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Bus Specifications: ${selectedBus.busNumber}`}
          subtitle={`${selectedBus.operator} • ${selectedBus.busName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#071330] to-[#0A2566] text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                  Registration Plate
                </span>
                <h3 className="text-xl font-black font-mono tracking-wider">
                  {selectedBus.busNumber}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">{selectedBus.busName}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedBus.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  {selectedBus.status}
                </span>
                <span className="block text-xs text-blue-200 mt-1 font-mono">
                  Base Fare: ₹{selectedBus.fare}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Capacity
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedBus.capacity} Seats
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Class</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedBus.isAc ? 'AC Luxury' : 'Non-AC'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Rating</span>
                <span className="font-extrabold text-amber-600 text-sm flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {selectedBus.rating || 4.8} / 5
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Driver</span>
                <span className="font-bold text-slate-800 text-xs truncate block">
                  {selectedBus.assignedDriver || 'Assigned on Dispatch'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Installed Amenities & Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBus.amenities?.map((am, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-primary border border-blue-100 font-semibold text-[11px]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    {am}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">Last Service / Maintenance Check:</span>
              <span className="font-mono font-bold text-slate-800">
                {selectedBus.lastServiceDate || '2026-11-01'}
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (busToDelete) {
            deleteBus(busToDelete.id);
            setBusToDelete(null);
          }
        }}
        title="Delete Bus from Fleet"
        message={`Are you sure you want to remove bus ${busToDelete?.busNumber} (${busToDelete?.busName})? This will decommission the vehicle from active booking schedules.`}
        confirmText="Yes, Delete Bus"
      />
    </div>
  );
};

export default BusManagementPage;
