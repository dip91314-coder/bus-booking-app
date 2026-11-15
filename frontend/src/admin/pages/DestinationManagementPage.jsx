import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { destinationApi, adminApi } from '../../services/api';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Upload,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const TAG_OPTIONS = ['Pilgrim', 'Heritage', 'Hill Station', 'Beach', 'Wildlife', 'Monsoon'];

const DestinationManagementPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [destToDelete, setDestToDelete] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form
  const defaultForm = {
    name: '',
    state: '',
    slug: '',
    tag: 'Pilgrim',
    title: '',
    description: '',
    image: '',
    startingFare: 500,
    highlights: '',
    featured: false,
    isActive: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const fetchDestinations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await destinationApi.getDestinations();
      setDestinations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load destinations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (dest) => {
    setSelectedDest(dest);
    setFormData({
      name: dest.name || '',
      state: dest.state || '',
      slug: dest.slug || '',
      tag: dest.tag || 'Pilgrim',
      title: dest.title || '',
      description: dest.description || '',
      image: dest.image || '',
      startingFare: dest.startingFare || 500,
      highlights: Array.isArray(dest.highlights) ? dest.highlights.join(', ') : '',
      featured: Boolean(dest.featured),
      isActive: dest.isActive ?? true,
    });
    setEditModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        highlights: formData.highlights.split(',').map((h) => h.trim()).filter(Boolean),
      };
      await destinationApi.createDestination(payload);
      toast.success('Destination created successfully');
      setAddModalOpen(false);
      fetchDestinations();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create destination');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        highlights: formData.highlights.split(',').map((h) => h.trim()).filter(Boolean),
      };
      await destinationApi.updateDestination(selectedDest._id || selectedDest.id, payload);
      toast.success('Destination updated successfully');
      setEditModalOpen(false);
      fetchDestinations();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update destination');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!destToDelete) return;
    try {
      await destinationApi.deleteDestination(destToDelete._id || destToDelete.id);
      toast.success('Destination deleted');
      setDeleteConfirmOpen(false);
      fetchDestinations();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete destination');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Photo',
      render: (row) => (
        <img
          src={row.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100'}
          alt={row.name}
          className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200"
        />
      ),
    },
    {
      key: 'name',
      label: 'Destination',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-500">{row.state}</span>
        </div>
      ),
    },
    {
      key: 'tag',
      label: 'Theme',
      render: (row) => (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          {row.tag}
        </span>
      ),
    },
    {
      key: 'startingFare',
      label: 'Starting Fare',
      render: (row) => (
        <span className="font-mono font-black text-slate-900">₹{row.startingFare}</span>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (
        row.featured ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" /> Featured
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Standard</span>
        )
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
            title="Edit Destination"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => { setDestToDelete(row); setDeleteConfirmOpen(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Destination"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" /> Destination Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage tourist hubs, pilgrimage spots, and explore circuits visible across customer pages
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      <DataTable
        columns={columns}
        data={destinations}
        isLoading={isLoading}
        error={error}
        onRetry={fetchDestinations}
        searchKey="name"
        searchPlaceholder="Search destinations..."
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={addModalOpen || editModalOpen}
        onClose={() => { setAddModalOpen(false); setEditModalOpen(false); }}
        title={addModalOpen ? 'Create New Destination' : 'Edit Destination'}
      >
        <form onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Destination Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Varanasi"
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Uttar Pradesh"
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Category / Tag</label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              >
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Starting Bus Fare (₹)</label>
              <input
                type="number"
                value={formData.startingFare}
                onChange={(e) => setFormData({ ...formData, startingFare: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Hero Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://... or upload below"
                className="flex-1 border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploadingImage} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Headline Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Sacred Ghats & Spiritual Awakening"
              className="w-full border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              placeholder="Detailed description of the destination..."
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Highlights (comma-separated)</label>
            <input
              type="text"
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              placeholder="e.g. Ganga Aarti, Kashi Vishwanath, Sarnath Stupa"
              className="w-full border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="featured" className="text-slate-800 font-bold select-none cursor-pointer">
              Show in Featured Destinations banner on homepage
            </label>
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
              {addModalOpen ? 'Create Destination' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Destination"
        message={`Are you sure you want to remove ${destToDelete?.name}? It will no longer appear on customer pages.`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default DestinationManagementPage;
