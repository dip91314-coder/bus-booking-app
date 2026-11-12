import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES_LIST = [
  'Super Admin',
  'Fleet Manager',
  'Operations Lead',
  'Terminal Dispatcher',
  'Customer Support Lead'
];

const StaffManagementPage = () => {
  const { staff, addStaff, updateStaff, deleteStaff } = useAdmin();

  // Filters
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Form State
  const defaultForm = {
    name: '',
    email: '',
    phone: '',
    role: 'Operations Lead',
    branch: 'New Delhi HQ',
    status: 'Active'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.branch.trim()) errs.branch = 'Assigned branch/terminal is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setSelectedStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      branch: member.branch,
      status: member.status
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDelete = (member) => {
    setStaffToDelete(member);
    setDeleteConfirmOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors.');
      return;
    }

    addStaff(formData);
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors.');
      return;
    }

    updateStaff(selectedStaff.id, formData);
    setEditModalOpen(false);
  };

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      return true;
    });
  }, [staff, roleFilter, statusFilter]);

  // Columns definition
  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
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
      key: 'role',
      label: 'Designation Role',
      render: (row) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            row.role === 'Super Admin'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : row.role === 'Fleet Manager'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : row.role === 'Operations Lead'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {row.role}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Contact Information',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-xs">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'branch',
      label: 'Terminal / Hub Branch',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.branch}</span>
        </div>
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
      key: 'joinedDate',
      label: 'Joined Date',
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
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title="Edit Staff Member"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Remove Staff"
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
            Staff & Operational Personnel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrative personnel, regional hub dispatchers, terminal officers, and customer support leads.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Filters:</span>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Roles</option>
          {ROLES_LIST.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {(roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setRoleFilter('ALL');
              setStatusFilter('ALL');
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
        data={filteredStaff}
        searchPlaceholder="Search staff by name, email, phone, role, hub..."
        searchKeys={['name', 'email', 'phone', 'role', 'branch', 'id']}
        exportFileName="operational_staff_directory"
      />

      {/* ADD STAFF MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Staff Member"
        subtitle="Provision operational platform access to a team member."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Shalini Sharma"
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
                Official Email *
              </label>
              <input
                type="email"
                placeholder="shalini.s@yatra.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-mono ${
                  formErrors.email ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                placeholder="+91 9811223344"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Role & Responsibility *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Assigned Branch / Terminal *
              </label>
              <input
                type="text"
                placeholder="e.g. Eastern Terminal Hub - Kolkata"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
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
                <option value="Inactive">Inactive</option>
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
              Confirm & Save Staff
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STAFF MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Staff: ${selectedStaff?.name}`}
        subtitle="Update role assignment or terminal branch."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Full Legal Name *
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
                Official Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-mono border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Role & Responsibility *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Assigned Branch / Terminal *
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
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
                <option value="Inactive">Inactive</option>
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
              Update Staff
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (staffToDelete) {
            deleteStaff(staffToDelete.id);
            setStaffToDelete(null);
          }
        }}
        title="Revoke Staff Access"
        message={`Are you sure you want to remove staff member ${staffToDelete?.name} (${staffToDelete?.role})?`}
        confirmText="Yes, Remove Staff"
      />
    </div>
  );
};

export default StaffManagementPage;
