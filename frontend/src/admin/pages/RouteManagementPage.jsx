import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Milestone,
  Plus,
  Edit,
  Trash2,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  Bus,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const RouteManagementPage = () => {
  const { routes, addRoute, updateRoute, deleteRoute } = useAdmin();

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeToDelete, setRouteToDelete] = useState(null);

  // Form State
  const defaultForm = {
    source: '',
    destination: '',
    distance: '',
    duration: '',
    highway: 'National Highway',
    stops: '',
    baseFare: 650,
    activeBusesCount: 12,
    status: 'Active'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.source.trim()) errs.source = 'Source city is required';
    if (!formData.destination.trim()) errs.destination = 'Destination is required';
    if (!formData.distance.trim()) errs.distance = 'Distance is required (e.g. 450 km)';
    if (!formData.duration.trim()) errs.duration = 'Duration is required (e.g. 8h 30m)';
    if (!formData.baseFare || Number(formData.baseFare) <= 0) errs.baseFare = 'Base fare must be > 0';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleOpenEdit = (route) => {
    setSelectedRoute(route);
    setFormData({
      source: route.source,
      destination: route.destination,
      distance: route.distance,
      duration: route.duration,
      highway: route.highway || '',
      stops: Array.isArray(route.stops) ? route.stops.join(', ') : route.stops || '',
      baseFare: route.baseFare,
      activeBusesCount: route.activeBusesCount,
      status: route.status
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDelete = (route) => {
    setRouteToDelete(route);
    setDeleteConfirmOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please complete all required fields.');
      return;
    }

    const stopsArray = formData.stops
      ? formData.stops.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    addRoute({
      ...formData,
      stops: stopsArray,
      baseFare: Number(formData.baseFare),
      activeBusesCount: Number(formData.activeBusesCount)
    });
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please complete all required fields.');
      return;
    }

    const stopsArray = formData.stops
      ? formData.stops.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    updateRoute(selectedRoute.id, {
      ...formData,
      stops: stopsArray,
      baseFare: Number(formData.baseFare),
      activeBusesCount: Number(formData.activeBusesCount)
    });
    setEditModalOpen(false);
  };

  // Columns definition
  const columns = [
    {
      key: 'id',
      label: 'Route ID',
      render: (row) => <span className="font-mono font-bold text-primary">{row.id}</span>
    },
    {
      key: 'source',
      label: 'Origin ➔ Destination',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <span>{row.source}</span>
            <span className="text-slate-400">➔</span>
            <span>{row.destination}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{row.highway}</span>
        </div>
      )
    },
    {
      key: 'distance',
      label: 'Distance',
      render: (row) => (
        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.distance}
        </span>
      )
    },
    {
      key: 'duration',
      label: 'Est. Duration',
      render: (row) => (
        <div className="flex items-center gap-1 text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.duration}</span>
        </div>
      )
    },
    {
      key: 'stops',
      label: 'Key Transit Stops',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.stops && row.stops.length > 0 ? (
            row.stops.map((stop, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
              >
                {stop}
              </span>
            ))
          ) : (
            <span className="text-slate-400 italic text-[11px]">Direct Non-Stop</span>
          )}
        </div>
      )
    },
    {
      key: 'activeBusesCount',
      label: 'Daily Schedules',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
          <Bus className="w-3.5 h-3.5 text-blue-600" />
          <span>{row.activeBusesCount} buses</span>
        </div>
      )
    },
    {
      key: 'baseFare',
      label: 'Starting Fare',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">₹{row.baseFare}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
            title="Edit Route"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Route"
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
            Interstate Route Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define point-to-point transit corridors, highway segments, intermediate stopping points, and default pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Route</span>
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={routes}
        searchPlaceholder="Search by city, highway, route ID..."
        searchKeys={['source', 'destination', 'highway', 'id']}
        exportFileName="interstate_routes"
      />

      {/* ADD ROUTE MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Interstate Transit Route"
        subtitle="Establish a new travel corridor on the network."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Source City *</label>
              <input
                type="text"
                placeholder="e.g. Kolkata"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.source ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Destination City *
              </label>
              <input
                type="text"
                placeholder="e.g. Siliguri"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.destination ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Distance *</label>
              <input
                type="text"
                placeholder="e.g. 560 km"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.distance ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Travel Duration *
              </label>
              <input
                type="text"
                placeholder="e.g. 10h 30m"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.duration ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Highway / Corridor
              </label>
              <input
                type="text"
                placeholder="e.g. NH-12 / NH-27"
                value={formData.highway}
                onChange={(e) => setFormData({ ...formData, highway: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Base Fare (₹) *
              </label>
              <input
                type="number"
                value={formData.baseFare}
                onChange={(e) => setFormData({ ...formData, baseFare: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-bold text-primary ${
                  formErrors.baseFare ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Intermediate Stops (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Malda Town, Raiganj, Dalkhola, Kishanganj"
              value={formData.stops}
              onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
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
              Confirm & Save Route
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT ROUTE MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Route: ${selectedRoute?.id}`}
        subtitle={`${selectedRoute?.source} ➔ ${selectedRoute?.destination}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Source City *</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Distance *</label>
              <input
                type="text"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Travel Duration *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Highway / Corridor
              </label>
              <input
                type="text"
                value={formData.highway}
                onChange={(e) => setFormData({ ...formData, highway: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Base Fare (₹) *
              </label>
              <input
                type="number"
                value={formData.baseFare}
                onChange={(e) => setFormData({ ...formData, baseFare: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-bold text-primary border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Intermediate Stops (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.stops}
              onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
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
              Update Route
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (routeToDelete) {
            deleteRoute(routeToDelete.id);
            setRouteToDelete(null);
          }
        }}
        title="Delete Route"
        message={`Are you sure you want to delete route ${routeToDelete?.source} ➔ ${routeToDelete?.destination}?`}
        confirmText="Yes, Delete Route"
      />
    </div>
  );
};

export default RouteManagementPage;
