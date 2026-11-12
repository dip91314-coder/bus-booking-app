import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatCard from '../components/StatCard';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  ShieldCheck,
  Flag,
  ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewManagementPage = () => {
  const { reviews, updateReviewStatus, deleteReview } = useAdmin();

  // Filters
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Review statistics
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const flaggedCount = useMemo(() => {
    return reviews.filter((r) => r.status === 'Flagged').length;
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== 'ALL' && r.rating !== Number(ratingFilter)) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      return true;
    });
  }, [reviews, ratingFilter, statusFilter]);

  const handleOpenDelete = (review) => {
    setReviewToDelete(review);
    setDeleteConfirmOpen(true);
  };

  // Columns definition
  const columns = [
    {
      key: 'passengerName',
      label: 'Passenger Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.passengerName}</span>
          <span className="text-[10px] text-slate-400 font-mono">ID: {row.id}</span>
        </div>
      )
    },
    {
      key: 'busName',
      label: 'Bus & Corridor',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 block">{row.busName}</span>
          <span className="text-[11px] text-slate-500">{row.route}</span>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Customer Rating',
      render: (row) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < row.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          ))}
          <span className="font-bold text-slate-700 text-xs ml-1">{row.rating}.0</span>
        </div>
      )
    },
    {
      key: 'comment',
      label: 'Feedback & Review Text',
      render: (row) => (
        <p className="text-slate-600 text-xs max-w-sm line-clamp-2 leading-relaxed">
          "{row.comment}"
        </p>
      )
    },
    {
      key: 'date',
      label: 'Review Date',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.date}</span>
      )
    },
    {
      key: 'status',
      label: 'Moderation Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'Published'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'Flagged'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.status === 'Published' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          {row.status === 'Flagged' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
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
            onClick={() => setSelectedReview(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition"
            title="Read Full Review"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status !== 'Published' && (
            <button
              type="button"
              onClick={() => updateReviewStatus(row.id, 'Published')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
              title="Approve & Publish"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
          )}
          {row.status !== 'Flagged' && (
            <button
              type="button"
              onClick={() => updateReviewStatus(row.id, 'Flagged')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Flag Review"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
            title="Delete Review"
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
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Customer Reviews & Experience Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor passenger satisfaction metrics, onboard hygiene ratings, driver conduct, and public testimonials.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Average Fleet Rating"
          value={`${averageRating} / 5.0`}
          subtitle="Based on verified ticket holders"
          trend="+0.2"
          trendType="up"
          icon={Star}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Total Feedback Submissions"
          value={reviews.length.toString()}
          subtitle="100% verified journey logs"
          icon={MessageSquare}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Flagged for Moderation"
          value={flaggedCount.toString()}
          subtitle="Requires supervisor review"
          trend={flaggedCount > 0 ? 'Action needed' : 'All clear'}
          trendType={flaggedCount > 0 ? 'down' : 'up'}
          icon={AlertTriangle}
          iconBg="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Filters:</span>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Star Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Moderation States</option>
          <option value="Published">Published</option>
          <option value="Flagged">Flagged</option>
          <option value="Under Review">Under Review</option>
        </select>

        {(ratingFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setRatingFilter('ALL');
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
        data={filteredReviews}
        searchPlaceholder="Search passenger, bus, route, keywords in feedback..."
        searchKeys={['passengerName', 'busName', 'route', 'comment', 'id']}
        exportFileName="passenger_reviews_audit"
      />

      {/* READ FULL REVIEW MODAL */}
      {selectedReview && (
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title={`Review Audit: ${selectedReview.id}`}
          subtitle={`By ${selectedReview.passengerName} on ${selectedReview.date}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Bus Coach & Route
                </span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReview.busName}</p>
                <p className="text-slate-500">{selectedReview.route}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{selectedReview.rating}.0 / 5</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                Passenger Testimonial
              </span>
              <p className="text-slate-700 text-sm leading-relaxed italic">
                "{selectedReview.comment}"
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Moderation State:</span>
              <span className="font-bold text-primary">{selectedReview.status}</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {selectedReview.status !== 'Published' && (
                <button
                  type="button"
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, 'Published');
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Approve & Publish
                </button>
              )}
              {selectedReview.status !== 'Flagged' && (
                <button
                  type="button"
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, 'Flagged');
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
                >
                  Flag for Review
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (reviewToDelete) {
            deleteReview(reviewToDelete.id);
            setReviewToDelete(null);
          }
        }}
        title="Delete Customer Review"
        message={`Are you sure you want to delete review ${reviewToDelete?.id} by ${reviewToDelete?.passengerName}?`}
        confirmText="Yes, Delete Review"
      />
    </div>
  );
};

export default ReviewManagementPage;
