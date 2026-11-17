import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import {
  Bell,
  Ticket,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Plus,
  CheckCheck,
  Clock,
  Filter,
  Loader2,
  Radio,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationManagementPage = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    unreadNotificationsCount
  } = useAdmin();

  // Active Category Filter Tab
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, booking, payment, cancellation, alert

  // Broadcast Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    category: 'alert'
  });

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'ALL') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error('Headline and detailed message are required.');
      return;
    }

    setIsBroadcasting(true);
    try {
      await addNotification({
        title: broadcastForm.title.trim(),
        message: broadcastForm.message.trim(),
        category: broadcastForm.category
      });

      setBroadcastModalOpen(false);
      setBroadcastForm({ title: '', message: '', category: 'alert' });
      toast.success('System announcement broadcasted to web portal and operations feed!');
    } catch (err) {
      toast.error(err?.message || 'Failed to broadcast notification.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'booking':
        return <Ticket className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'cancellation':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  const getCategoryBg = (cat) => {
    switch (cat) {
      case 'booking':
        return 'bg-blue-50 border-blue-100';
      case 'payment':
        return 'bg-emerald-50 border-emerald-100';
      case 'cancellation':
        return 'bg-rose-50 border-rose-100';
      default:
        return 'bg-amber-50 border-amber-100';
    }
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Operational Notification Hub
            </h1>
            {unreadNotificationsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                {unreadNotificationsCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time administrative feed for reservations, payment gateway reconciliations, and cancellations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setBroadcastModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Notifications"
          value={notifications.length}
          subtitle="lifetime operational events"
          icon={Bell}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Unread Alerts"
          value={unreadNotificationsCount}
          subtitle="pending dispatcher review"
          icon={AlertTriangle}
          iconBg="bg-rose-50 text-rose-600"
          badge={unreadNotificationsCount > 0 ? "Action Needed" : "Clear"}
        />
        <StatCard
          title="Booking Events"
          value={notifications.filter((n) => n.category === 'booking').length}
          subtitle="reservations & ticketing"
          icon={Ticket}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Payment & System"
          value={notifications.filter((n) => n.category === 'payment' || n.category === 'alert').length}
          subtitle="gateway & infrastructure"
          icon={CreditCard}
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 text-xs font-semibold">
        {[
          { id: 'ALL', label: 'All Notifications', count: notifications.length },
          {
            id: 'booking',
            label: 'New Bookings',
            count: notifications.filter((n) => n.category === 'booking').length
          },
          {
            id: 'payment',
            label: 'Payment Settlements',
            count: notifications.filter((n) => n.category === 'payment').length
          },
          {
            id: 'cancellation',
            label: 'Cancellations & Refunds',
            count: notifications.filter((n) => n.category === 'cancellation').length
          },
          {
            id: 'alert',
            label: 'System & Maintenance Alerts',
            count: notifications.filter((n) => n.category === 'alert').length
          }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
              activeTab === tab.id
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification Stream Cards */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !notif.read
                  ? 'bg-blue-50/40 border-blue-200/80 shadow-sm'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${getCategoryBg(
                    notif.category
                  )}`}
                >
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{notif.time}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {!notif.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notif.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-blue-50 rounded-xl transition"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
                  title="Dismiss Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Notifications in this Category</h4>
            <p className="text-xs text-slate-400 mt-1">
              You are all caught up! New operational events will appear here in real-time.
            </p>
          </div>
        )}
      </div>

      {/* BROADCAST ALERT MODAL */}
      <Modal
        isOpen={broadcastModalOpen}
        onClose={() => !isBroadcasting && setBroadcastModalOpen(false)}
        title="Broadcast System Announcement"
        subtitle="Publish a live announcement to the customer web portal and operations control center."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Alert Headline *
            </label>
            <input
              type="text"
              placeholder="e.g. Fog Warning on NH-48 Jaipur Route"
              value={broadcastForm.title}
              disabled={isBroadcasting}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Category Channel
            </label>
            <select
              value={broadcastForm.category}
              disabled={isBroadcasting}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="alert">System Alert (Announcements & Weather)</option>
              <option value="booking">Booking Operation (Ticketing updates)</option>
              <option value="payment">Financial Gateway (Payment alerts)</option>
              <option value="cancellation">Cancellation & Delay Notices</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Detailed Announcement *
            </label>
            <textarea
              rows="3"
              placeholder="Enter message details for customers and dispatchers..."
              value={broadcastForm.message}
              disabled={isBroadcasting}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isBroadcasting}
              onClick={() => setBroadcastModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBroadcasting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Broadcast</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationManagementPage;
