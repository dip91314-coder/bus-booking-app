import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const OfferManagementPage = () => {
  const { offers, addOffer, updateOffer, toggleOfferStatus, deleteOffer } = useAdmin();

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerToDelete, setOfferToDelete] = useState(null);

  // Form State
  const defaultForm = {
    code: '',
    title: '',
    discountPercentage: 15,
    maxDiscount: 250,
    minBookingAmount: 500,
    expiryDate: '2026-12-31',
    usageLimit: 2000,
    description: '',
    status: 'Active'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.code.trim()) errs.code = 'Coupon code is required (e.g. SUMMER25)';
    if (!formData.title.trim()) errs.title = 'Offer title is required';
    if (!formData.discountPercentage || Number(formData.discountPercentage) <= 0)
      errs.discountPercentage = 'Discount % must be between 1 and 100';
    if (!formData.expiryDate) errs.expiryDate = 'Expiry date is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setSelectedOffer(offer);
    setFormData({
      code: offer.code,
      title: offer.title,
      discountPercentage: offer.discountPercentage,
      maxDiscount: offer.maxDiscount,
      minBookingAmount: offer.minBookingAmount,
      expiryDate: offer.expiryDate,
      usageLimit: offer.usageLimit || 1000,
      description: offer.description || '',
      status: offer.status
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDelete = (offer) => {
    setOfferToDelete(offer);
    setDeleteConfirmOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors.');
      return;
    }

    addOffer({
      ...formData,
      code: formData.code.toUpperCase().replace(/\s+/g, ''),
      discountPercentage: Number(formData.discountPercentage),
      maxDiscount: Number(formData.maxDiscount),
      minBookingAmount: Number(formData.minBookingAmount),
      usageLimit: Number(formData.usageLimit)
    });
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors.');
      return;
    }

    updateOffer(selectedOffer.id, {
      ...formData,
      code: formData.code.toUpperCase().replace(/\s+/g, ''),
      discountPercentage: Number(formData.discountPercentage),
      maxDiscount: Number(formData.maxDiscount),
      minBookingAmount: Number(formData.minBookingAmount),
      usageLimit: Number(formData.usageLimit)
    });
    setEditModalOpen(false);
  };

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      return true;
    });
  }, [offers, statusFilter]);

  // Columns definition
  const columns = [
    {
      key: 'code',
      label: 'Coupon Code',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 tracking-wider">
            {row.code}
          </span>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Campaign Title & Details',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-[11px] text-slate-400 line-clamp-1">{row.description}</span>
        </div>
      )
    },
    {
      key: 'discountPercentage',
      label: 'Discount Benefit',
      render: (row) => (
        <div>
          <span className="font-bold text-emerald-700 text-xs">
            {row.discountPercentage}% OFF
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Max Cap: ₹{row.maxDiscount}
          </span>
        </div>
      )
    },
    {
      key: 'minBookingAmount',
      label: 'Min Spend',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 text-xs">
          ₹{row.minBookingAmount}
        </span>
      )
    },
    {
      key: 'expiryDate',
      label: 'Valid Until',
      render: (row) => (
        <div className="flex items-center gap-1 font-mono text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.expiryDate}</span>
        </div>
      )
    },
    {
      key: 'usageCount',
      label: 'Redemptions',
      render: (row) => {
        const used = row.usageCount || 0;
        const limit = row.usageLimit || 1000;
        const pct = Math.min(100, Math.round((used / limit) * 100));

        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-800 font-mono">{used}</span>
              <span className="text-slate-400 font-mono">/ {limit}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
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
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'Expired'
              ? 'bg-slate-100 text-slate-500 border border-slate-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status === 'Active' ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <XCircle className="w-3 h-3 text-slate-400" />
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
            onClick={() => toggleOfferStatus(row.id)}
            className={`p-1.5 rounded-lg transition ${
              row.status === 'Active'
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={row.status === 'Active' ? 'Deactivate Offer' : 'Activate Offer'}
          >
            {row.status === 'Active' ? (
              <ToggleRight className="w-5 h-5 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title="Edit Coupon"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Offer"
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
            Offers & Discount Coupons
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create promotional coupon codes, percentage rebates, minimum cart requirements, and expiry limits.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Coupons</option>
          <option value="Active">Active Campaigns</option>
          <option value="Disabled">Disabled</option>
          <option value="Expired">Expired</option>
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
        data={filteredOffers}
        searchPlaceholder="Search coupon code, campaign title..."
        searchKeys={['code', 'title', 'description', 'id']}
        exportFileName="promotional_coupons"
      />

      {/* CREATE OFFER MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create Promotional Coupon"
        subtitle="Configure discount rates and redemption criteria."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                placeholder="e.g. YATRAPASS25"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-mono uppercase ${
                  formErrors.code ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {formErrors.code && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.code}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Weekend Getaway Rebate"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  formErrors.title ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Discount (%) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Max Cap (₹)</label>
              <input
                type="number"
                min="50"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Min Spend (₹)</label>
              <input
                type="number"
                min="100"
                value={formData.minBookingAmount}
                onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                min="10"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Public Description
            </label>
            <textarea
              rows="2"
              placeholder="Detailed terms e.g. Valid on all interstate Volvo bookings..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Publish Coupon
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT OFFER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Coupon: ${selectedOffer?.code}`}
        subtitle="Modify discount percentage or validity rules."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border font-mono uppercase border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Discount (%) *
              </label>
              <input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Max Cap (₹)</label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Min Spend (₹)</label>
              <input
                type="number"
                value={formData.minBookingAmount}
                onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Public Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Update Coupon
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (offerToDelete) {
            deleteOffer(offerToDelete.id);
            setOfferToDelete(null);
          }
        }}
        title="Delete Coupon"
        message={`Are you sure you want to permanently delete coupon ${offerToDelete?.code}? Passengers will no longer be able to apply this code.`}
        confirmText="Yes, Delete Coupon"
      />
    </div>
  );
};

export default OfferManagementPage;
