import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { packageApi, adminApi } from '../../services/api';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Upload,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Pilgrim', 'Konkan', 'Leisure', 'Monsoon', 'Heritage'];

const PackageManagementPage = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [pkgToDelete, setPkgToDelete] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form
  const defaultForm = {
    title: '',
    slug: '',
    category: 'Konkan',
    packageType: 'Coastal Route',
    durationDays: 3,
    durationNights: 2,
    pricePerPerson: 4500,
    image: '',
    routeDescription: 'Pune ➔ Mahabaleshwar ➔ Ganpatipule',
    departureCity: 'Pune',
    destinationCity: 'Ganpatipule',
    featured: false,
    isActive: true,
    itinerary: [
      { day: 1, title: 'Departure & Sightseeing', description: 'Scenic coach ride and check-in to resort.', meals: ['Lunch', 'Dinner'] },
      { day: 2, title: 'Local Attractions & Temple Visit', description: 'Full day excursion with guided tour.', meals: ['Breakfast', 'Dinner'] },
      { day: 3, title: 'Leisure & Return Journey', description: 'Morning leisure, shopping, and return coach.', meals: ['Breakfast'] },
    ],
  };
  const [formData, setFormData] = useState(defaultForm);

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await packageApi.getAdminPackages();
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load tour packages');
    } finally {
      setIsLoading(false);
    }
  };

  const location = useLocation();
  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new' || params.get('create') === 'true') {
      handleOpenAdd();
    }
  }, [location.search]);

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setSelectedPkg(pkg);
    setFormData({
      title: pkg.title || '',
      slug: pkg.slug || '',
      category: pkg.category || 'Konkan',
      packageType: pkg.packageType || 'Scenic Circuit',
      durationDays: pkg.durationDays || 3,
      durationNights: pkg.durationNights || 2,
      pricePerPerson: pkg.pricePerPerson || 4500,
      image: pkg.image || '',
      routeDescription: pkg.routeDescription || '',
      departureCity: pkg.departureCity || '',
      destinationCity: pkg.destinationCity || '',
      featured: Boolean(pkg.featured),
      isActive: pkg.isActive ?? true,
      itinerary: pkg.itinerary?.length ? pkg.itinerary : defaultForm.itinerary,
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
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };
      await packageApi.createPackage(payload);
      toast.success('Tour package created successfully');
      setAddModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create tour package');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await packageApi.updatePackage(selectedPkg._id || selectedPkg.id, formData);
      toast.success('Tour package updated successfully');
      setEditModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update tour package');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pkgToDelete) return;
    try {
      await packageApi.deletePackage(pkgToDelete._id || pkgToDelete.id);
      toast.success('Tour package removed');
      setDeleteConfirmOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete tour package');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Photo',
      render: (row) => (
        <img
          src={row.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100'}
          alt={row.title}
          className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200"
        />
      ),
    },
    {
      key: 'title',
      label: 'Package & Circuit',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-[11px] text-slate-500">{row.routeDescription}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.category}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => (
        <span className="font-bold text-slate-700 text-xs">
          {row.durationDays}D / {row.durationNights}N
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price / Person',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">₹{row.pricePerPerson}</span>
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
          <span className="text-slate-400 text-xs">Regular</span>
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
            title="Edit Package"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => { setPkgToDelete(row); setDeleteConfirmOpen(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Package"
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
            <Package className="w-6 h-6 text-indigo-600" /> Short Trips & Weekend Circuits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage pre-packaged bus holiday getaways, pilgrimage tours, and monsoon trails
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create Circuit Package
        </button>
      </div>

      <DataTable
        columns={columns}
        data={packages}
        isLoading={isLoading}
        error={error}
        onRetry={fetchPackages}
        searchKey="title"
        searchPlaceholder="Search packages..."
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={addModalOpen || editModalOpen}
        onClose={() => { setAddModalOpen(false); setEditModalOpen(false); }}
        title={addModalOpen ? 'Create New Circuit Package' : 'Edit Tour Package'}
      >
        <form onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Package Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mahabaleshwar Coastal Getaway"
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Duration Days</label>
              <input
                type="number"
                min="1"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Duration Nights</label>
              <input
                type="number"
                min="0"
                value={formData.durationNights}
                onChange={(e) => setFormData({ ...formData, durationNights: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Price / Person (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Departure City</label>
              <input
                type="text"
                value={formData.departureCity}
                onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                placeholder="e.g. Pune"
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Destination City</label>
              <input
                type="text"
                value={formData.destinationCity}
                onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                placeholder="e.g. Ganpatipule"
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Route Description</label>
            <input
              type="text"
              value={formData.routeDescription}
              onChange={(e) => setFormData({ ...formData, routeDescription: e.target.value })}
              placeholder="e.g. Pune ➔ Mahabaleshwar ➔ Ganpatipule"
              className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              required
            />
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

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-slate-800 font-bold">Featured Package</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-slate-800 font-bold">Active &amp; Bookable</span>
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
              {addModalOpen ? 'Create Package' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tour Package"
        message={`Are you sure you want to remove package "${pkgToDelete?.title}"?`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default PackageManagementPage;
