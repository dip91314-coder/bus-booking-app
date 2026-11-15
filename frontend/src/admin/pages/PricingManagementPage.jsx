import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { adminApi } from '../../services/api';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Calculator,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PricingManagementPage = () => {
  const { routes, buses, isLoading: adminLoading } = useAdmin();
  const [pricingRules, setPricingRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);

  // Live Calculator Preview State
  const [previewRouteId, setPreviewRouteId] = useState('');
  const [previewDate, setPreviewDate] = useState(new Date().toISOString().slice(0, 10));
  const [previewSeatType, setPreviewSeatType] = useState('seater');
  const [previewPosition, setPreviewPosition] = useState('lower');
  const [previewRow, setPreviewRow] = useState(1);
  const [previewResult, setPreviewResult] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form State
  const defaultForm = {
    routeId: '',
    busId: '',
    seatType: 'all',
    basePrice: 600,
    taxPercent: 5,
    dayOfWeekMultiplier: 1.0,
    weekendMultiplier: 1.2,
    festiveMultiplier: 1.25,
    lastMinuteMultiplier: 1.15,
    sleeperMultiplier: 1.2,
    lowerBerthMultiplier: 1.1,
    frontRowMultiplier: 1.05,
    isActive: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const fetchPricingRules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getManagementData();
      if (data && data.pricing) {
        setPricingRules(Array.isArray(data.pricing) ? data.pricing : []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load pricing rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingRules();
  }, []);

  // Update preview automatically when inputs change
  useEffect(() => {
    let isCurrent = true;
    const calculatePreview = async () => {
      setPreviewLoading(true);
      try {
        const res = await adminApi.previewPricing({
          routeId: previewRouteId || undefined,
          date: previewDate,
          seatType: previewSeatType,
          position: previewPosition,
          row: Number(previewRow),
        });
        if (isCurrent && res) {
          setPreviewResult(res);
        }
      } catch {
        // Fallback default calculation
        if (isCurrent) {
          const base = 500;
          const isWeekend = [0, 5, 6].includes(new Date(previewDate).getDay());
          const mult = (isWeekend ? 1.2 : 1) * (previewSeatType === 'sleeper' ? 1.2 : 1);
          const subtotal = Math.round(base * mult);
          setPreviewResult({
            basePrice: base,
            subtotal,
            taxPercent: 5,
            taxAmount: Math.round(subtotal * 0.05),
            finalFare: subtotal + Math.round(subtotal * 0.05),
            appliedMultipliers: { ...(isWeekend && { weekend: 1.2 }), ...(previewSeatType === 'sleeper' && { sleeper: 1.2 }) }
          });
        }
      } finally {
        if (isCurrent) setPreviewLoading(false);
      }
    };
    calculatePreview();
    return () => { isCurrent = false; };
  }, [previewRouteId, previewDate, previewSeatType, previewPosition, previewRow]);

  const handleOpenAdd = () => {
    setFormData({
      ...defaultForm,
      routeId: routes[0]?.id || '',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setSelectedRule(rule);
    setFormData({
      routeId: rule.routeId?._id || rule.routeId || '',
      busId: rule.busId?._id || rule.busId || '',
      seatType: rule.seatType || 'all',
      basePrice: rule.basePrice || 600,
      taxPercent: rule.taxPercent || 5,
      dayOfWeekMultiplier: rule.dayOfWeekMultiplier || 1.0,
      weekendMultiplier: rule.weekendMultiplier || 1.2,
      festiveMultiplier: rule.festiveMultiplier || 1.25,
      lastMinuteMultiplier: rule.lastMinuteMultiplier || 1.15,
      sleeperMultiplier: rule.sleeperMultiplier || 1.2,
      lowerBerthMultiplier: rule.lowerBerthMultiplier || 1.1,
      frontRowMultiplier: rule.frontRowMultiplier || 1.05,
      isActive: rule.isActive ?? true,
    });
    setEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createResource('pricing', formData);
      toast.success('Pricing rule created successfully');
      setAddModalOpen(false);
      fetchPricingRules();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create pricing rule');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateResource('pricing', selectedRule._id || selectedRule.id, formData);
      toast.success('Pricing rule updated successfully');
      setEditModalOpen(false);
      fetchPricingRules();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update pricing rule');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;
    try {
      await adminApi.deleteResource('pricing', ruleToDelete._id || ruleToDelete.id);
      toast.success('Pricing rule deleted');
      setDeleteConfirmOpen(false);
      fetchPricingRules();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete pricing rule');
    }
  };

  const columns = [
    {
      key: 'scope',
      label: 'Applicable Route / Bus',
      render: (row) => {
        const route = routes.find((r) => r.id === (row.routeId?._id || row.routeId));
        const bus = buses.find((b) => b.id === (row.busId?._id || row.busId));
        return (
          <div>
            <span className="font-bold text-slate-900 block">
              {route ? `${route.origin} ➔ ${route.destination}` : bus ? `${bus.busNumber} (${bus.busName})` : 'All Default Routes'}
            </span>
            <span className="text-[11px] text-slate-500">Seat Type: <strong className="uppercase">{row.seatType}</strong></span>
          </div>
        );
      },
    },
    {
      key: 'basePrice',
      label: 'Base Fare',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">₹{row.basePrice}</span>
      ),
    },
    {
      key: 'multipliers',
      label: 'Multipliers',
      render: (row) => (
        <div className="flex flex-wrap gap-1 text-[10px]">
          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium border border-amber-200">
            Weekend: {row.weekendMultiplier || 1.2}x
          </span>
          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium border border-purple-200">
            Sleeper: {row.sleeperMultiplier || 1.2}x
          </span>
          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium border border-blue-200">
            Lower: {row.lowerBerthMultiplier || 1.1}x
          </span>
        </div>
      ),
    },
    {
      key: 'taxPercent',
      label: 'GST %',
      render: (row) => <span className="font-bold text-slate-700">{row.taxPercent || 5}%</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          row.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {row.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-slate-400" />}
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title="Edit Rule"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => { setRuleToDelete(row); setDeleteConfirmOpen(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" /> Multi-Tier Pricing Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic route base fares, weekend surges, berth premiums, and live fare breakdowns
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Pricing Rule
        </button>
      </div>

      {/* LIVE FARE PREVIEW CALCULATOR */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-lg border border-indigo-900/40">
        <div className="flex items-center justify-between mb-4 border-b border-indigo-800/50 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Live Price Preview Engine</h2>
          </div>
          <span className="text-[11px] bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
            Real-Time Fare Simulator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Select Route</label>
            <select
              value={previewRouteId}
              onChange={(e) => setPreviewRouteId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
            >
              <option value="">Default General Fare</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.origin} ➔ {r.destination}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Travel Date</label>
            <input
              type="date"
              value={previewDate}
              onChange={(e) => setPreviewDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Seat Type</label>
            <select
              value={previewSeatType}
              onChange={(e) => setPreviewSeatType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
            >
              <option value="seater">Seater (Standard)</option>
              <option value="sleeper">Sleeper (+20%)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Berth Position</label>
            <select
              value={previewPosition}
              onChange={(e) => setPreviewPosition(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
            >
              <option value="lower">Lower Deck (+10%)</option>
              <option value="upper">Upper Deck (Standard)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Seat Row</label>
            <select
              value={previewRow}
              onChange={(e) => setPreviewRow(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
            >
              <option value={1}>Row 1 (Front Row +5%)</option>
              <option value={2}>Row 2 (Standard)</option>
              <option value={3}>Row 3 (Standard)</option>
            </select>
          </div>
        </div>

        {/* Breakdown output */}
        {previewResult && (
          <div className="bg-slate-950/60 rounded-xl p-3 border border-indigo-800/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Base Fare</span>
                <span className="font-bold text-white text-sm">₹{previewResult.basePrice}</span>
              </div>
              <div className="text-slate-500 font-bold">+</div>
              <div>
                <span className="text-slate-400 block text-[11px]">Applied Multipliers</span>
                <div className="flex gap-1.5 mt-0.5">
                  {Object.entries(previewResult.appliedMultipliers || {}).map(([key, val]) => (
                    <span key={key} className="bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {key}: {val}x
                    </span>
                  ))}
                  {Object.keys(previewResult.appliedMultipliers || {}).length === 0 && (
                    <span className="text-slate-400 italic text-[11px]">None (Base Rate)</span>
                  )}
                </div>
              </div>
              <div className="text-slate-500 font-bold">+</div>
              <div>
                <span className="text-slate-400 block text-[11px]">GST ({previewResult.taxPercent}%)</span>
                <span className="font-bold text-white text-sm">₹{previewResult.taxAmount}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-emerald-400 block text-[11px] font-bold uppercase tracking-wider">Final Computed Fare</span>
              <span className="text-2xl font-black text-emerald-300 font-mono">₹{previewResult.finalFare}</span>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table */}
      <DataTable
        columns={columns}
        data={pricingRules}
        isLoading={isLoading || adminLoading}
        error={error}
        onRetry={fetchPricingRules}
        searchKey="basePrice"
        searchPlaceholder="Search pricing rules..."
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={addModalOpen || editModalOpen}
        onClose={() => { setAddModalOpen(false); setEditModalOpen(false); }}
        title={addModalOpen ? 'Create Multi-Tier Pricing Rule' : 'Edit Pricing Rule'}
      >
        <form onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Target Route</label>
              <select
                value={formData.routeId}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="">All Routes (Global Baseline)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.origin} ➔ {r.destination}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Seat Type</label>
              <select
                value={formData.seatType}
                onChange={(e) => setFormData({ ...formData, seatType: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="all">All Seats</option>
                <option value="seater">Seater Only</option>
                <option value="sleeper">Sleeper Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Base Price (₹)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">GST Tax %</label>
              <input
                type="number"
                value={formData.taxPercent}
                onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h3 className="font-bold text-slate-900 mb-2">Dynamic Fare Multipliers</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Weekend (Fri-Sun)</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.weekendMultiplier}
                  onChange={(e) => setFormData({ ...formData, weekendMultiplier: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Festive Date</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.festiveMultiplier}
                  onChange={(e) => setFormData({ ...formData, festiveMultiplier: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Last Minute (&lt;6h)</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.lastMinuteMultiplier}
                  onChange={(e) => setFormData({ ...formData, lastMinuteMultiplier: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Sleeper Berth</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.sleeperMultiplier}
                  onChange={(e) => setFormData({ ...formData, sleeperMultiplier: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Lower Deck Berth</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.lowerBerthMultiplier}
                  onChange={(e) => setFormData({ ...formData, lowerBerthMultiplier: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Front Row</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.frontRowMultiplier}
                  onChange={(e) => setFormData({ ...formData, frontRowMultiplier: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg"
            >
              {addModalOpen ? 'Save Pricing Rule' : 'Update Rule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Pricing Rule"
        message="Are you sure you want to delete this pricing rule? Buses on this route will fall back to their standard catalog fare."
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default PricingManagementPage;
