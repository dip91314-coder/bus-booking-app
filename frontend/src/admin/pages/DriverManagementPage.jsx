import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Contact2,
  Plus,
  Edit,
  Trash2,
  Bus,
  Phone,
  Award,
  Star,
  CheckCircle2,
  Clock,
  Coffee,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const DriverManagementPage = () => {
  const { drivers, buses, addDriver, updateDriver, deleteDriver } = useAdmin();

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);

  // Form State
  const defaultForm = {
    name: '',
    phone: '',
    licenseNumber: '',
    experienceYears: 10,
    busId: '',
    status: 'Available'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Driver name is required';
    if (!formData.phone.trim()) errs.phone = 'Contact phone is required';
    if (!formData.licenseNumber.trim()) errs.licenseNumber = 'Commercial HMV license number is required';
    if (!formData.experienceYears || Number(formData.experienceYears) <= 0)
      errs.experienceYears = 'Experience must be > 0';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      experienceYears: driver.experienceYears,
      busId: driver.busId || '',
      status: driver.status
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDelete = (driver) => {
    setDriverToDelete(driver);
    setDeleteConfirmOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve all validation errors.');
      return;
    }

    const assignedBusObj = buses.find((b) => b.id === formData.busId);
    const assignedBusLabel = assignedBusObj
      ? `${assignedBusObj.busNumber} (${assignedBusObj.busName})`
      : 'Unassigned';

    addDriver({
      ...formData,
      assignedBus: assignedBusLabel,
      experienceYears: Number(formData.experienceYears)
    });
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve all validation errors.');
      return;
    }

    const assignedBusObj = buses.find((b) => b.id === formData.busId);
    const assignedBusLabel = assignedBusObj
      ? `${assignedBusObj.busNumber} (${assignedBusObj.busName})`
      : 'Unassigned';

    updateDriver(selectedDriver.id, {
      ...formData,
      assignedBus: assignedBusLabel,
      experienceYears: Number(formData.experienceYears)
    });
    setEditModalOpen(false);
  };

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      return true;
    });
  }, [drivers, statusFilter]);

  // Columns definition
  const columns = [
    {
      key: 'name',
      label: 'Driver Identity',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
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
      key: 'licenseNumber',
      label: 'HMV Commercial License',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.licenseNumber}
        </span>
      )
    },
    {
      key: 'phone',
      label: 'Contact Phone',
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.phone}</span>
        </div>
      )
    },
    {
      key: 'experienceYears',
      label: 'Experience',
      render: (row) => (
        <span className="font-semibold text-slate-700 text-xs">
          {row.experienceYears} Years
        </span>
      )
    },
    {
      key: 'assignedBus',
      label: 'Assigned Coach',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Bus className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-bold text-slate-800 truncate max-w-xs">{row.assignedBus}</span>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Safety Rating',
      render: (row) => (
        <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{row.rating || 4.8}</span>
          <span className="text-slate-400 text-[10px]">({row.tripsCompleted || 350} trips)</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Availability',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'Available'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'On Journey'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.status === 'Available' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          {row.status === 'On Journey' && <Clock className="w-3 h-3 text-blue-600 animate-spin" />}
          {row.status === 'On Leave' && <Coffee className="w-3 h-3 text-amber-600" />}
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
            title="Edit Driver Details or Reassign Coach"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Driver Profile"
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
            Captain & Driver Fleet Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain verified commercial heavy vehicle (HMV) drivers, safety ratings, shift statuses, and coach linkages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Driver</span>
        </button>
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Duty Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Drivers</option>
          <option value="Available">Available for Dispatch</option>
          <option value="On Journey">On Journey</option>
          <option value="On Leave">On Leave</option>
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
        data={filteredDrivers}
        searchPlaceholder="Search driver name, phone, license, bus..."
        searchKeys={['name', 'phone', 'licenseNumber', 'assignedBus', 'id']}
        exportFileName="driver_fleet_roster"
      />

      {/* ADD DRIVER MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register Commercial Driver"
        subtitle="Enlist a qualified heavy motor vehicle coach pilot."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Driver Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Chandra"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.name ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-mono ${
                  formErrors.phone ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                HMV License Number *
              </label>
              <input
                type="text"
                placeholder="e.g. WB-20100098765"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-mono uppercase ${
                  formErrors.licenseNumber ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Experience (Years) *
              </label>
              <input
                type="number"
                min="1"
                max="45"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Assign to Bus Coach
            </label>
            <select
              value={formData.busId}
              onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">-- No Coach Assigned (Floating Reserve) --</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} — {b.operator} ({b.busName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Availability Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="Available">Available for Dispatch</option>
              <option value="On Journey">On Journey</option>
              <option value="On Leave">On Leave</option>
            </select>
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
              Enlist Driver
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT DRIVER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Driver: ${selectedDriver?.name}`}
        subtitle="Update contact, bus allocation, or duty status."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Driver Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-mono border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                HMV License Number *
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-mono uppercase border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Experience (Years) *
              </label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Assign to Bus Coach
            </label>
            <select
              value={formData.busId}
              onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">-- No Coach Assigned (Floating Reserve) --</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} — {b.operator} ({b.busName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Availability Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="Available">Available for Dispatch</option>
              <option value="On Journey">On Journey</option>
              <option value="On Leave">On Leave</option>
            </select>
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
              Save Driver Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (driverToDelete) {
            deleteDriver(driverToDelete.id);
            setDriverToDelete(null);
          }
        }}
        title="Remove Driver"
        message={`Are you sure you want to remove ${driverToDelete?.name} (${driverToDelete?.licenseNumber}) from the system roster?`}
        confirmText="Yes, Remove Driver"
      />
    </div>
  );
};

export default DriverManagementPage;
