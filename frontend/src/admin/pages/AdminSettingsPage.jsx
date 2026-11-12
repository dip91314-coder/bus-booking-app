import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Settings,
  User,
  Lock,
  Bell,
  Globe,
  ShieldCheck,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const { settings, updateSettings, changePassword } = useAdmin();

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, general, notifications

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    adminName: settings.adminName || 'Vikram Das',
    adminEmail: settings.adminEmail || 'admin@bharatbus.com',
    adminPhone: settings.adminPhone || '+91 9811223344',
    adminRole: settings.adminRole || 'Super Admin'
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // General Settings Form
  const [generalForm, setGeneralForm] = useState({
    platformTitle: settings.platformTitle || 'BharatBus Logistics & Fleet Operations',
    currency: settings.currency || 'INR (₹)',
    taxGstRate: settings.taxGstRate || 5,
    supportEmail: settings.supportEmail || 'support@bharatbus.com',
    supportHelpline: settings.supportHelpline || '1800-200-9988',
    maintenanceMode: settings.maintenanceMode || false
  });

  // Notification Preferences Form
  const [notifPreferences, setNotifPreferences] = useState({
    emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
    smsNotifications: settings.smsNotifications !== undefined ? settings.smsNotifications : true,
    dailyDigest: settings.dailyDigest !== undefined ? settings.dailyDigest : true,
    soundAlerts: settings.soundAlerts !== undefined ? settings.soundAlerts : false
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.adminName.trim() || !profileForm.adminEmail.trim()) {
      toast.error('Name and Email are required.');
      return;
    }
    updateSettings(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    const success = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    updateSettings(generalForm);
  };

  const handleNotifPrefSubmit = (e) => {
    e.preventDefault();
    updateSettings(notifPreferences);
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Configuration & Admin Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage super administrative credentials, global currency & GST rules, platform contacts, and alerts.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tab Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          {[
            { id: 'profile', label: 'Admin Profile', icon: User, desc: 'Personal details and credentials' },
            { id: 'password', label: 'Change Password', icon: Lock, desc: 'Security and session keys' },
            { id: 'general', label: 'Platform & Operations', icon: Globe, desc: 'GST, contact emails, currency' },
            { id: 'notifications', label: 'Notification Settings', icon: Bell, desc: 'Email, SMS, system alerts' }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition ${
                  active
                    ? 'bg-white shadow-sm border border-slate-200/80 text-primary font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block">{tab.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal line-clamp-1">
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          {/* TAB 1: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Administrator Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your contact identity as seen by internal dispatchers and staff.
                </p>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xl font-black flex items-center justify-center shadow-md">
                  {profileForm.adminName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{profileForm.adminName}</h4>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-primary border border-blue-200">
                    {profileForm.adminRole}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.adminName}
                    onChange={(e) => setProfileForm({ ...profileForm, adminName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Administrative Email *
                  </label>
                  <input
                    type="email"
                    value={profileForm.adminEmail}
                    onChange={(e) => setProfileForm({ ...profileForm, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Direct Helpline / Phone
                  </label>
                  <input
                    type="text"
                    value={profileForm.adminPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, adminPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Assigned Privilege Level
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profileForm.adminRole}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 text-xs max-w-md">
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Admin Password</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your credentials regularly to safeguard access to sensitive manifests.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full pr-10 px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full pr-10 px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition"
                >
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PLATFORM & OPERATIONS */}
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit} className="space-y-6 text-xs max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Platform Configuration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Universal booking parameters, GST tax rates, and support hotline contact points.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Platform Legal Brand Title
                  </label>
                  <input
                    type="text"
                    value={generalForm.platformTitle}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, platformTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Operating Currency
                  </label>
                  <input
                    type="text"
                    value={generalForm.currency}
                    onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    GST / Service Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={generalForm.taxGstRate}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, taxGstRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    24x7 Support Helpline
                  </label>
                  <input
                    type="text"
                    value={generalForm.supportHelpline}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, supportHelpline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Customer Grievance & Escalation Email
                </label>
                <input
                  type="email"
                  value={generalForm.supportEmail}
                  onChange={(e) =>
                    setGeneralForm({ ...generalForm, supportEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              {/* Maintenance Toggle */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Emergency Maintenance Mode</span>
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Temporarily pause passenger bookings across web storefront while executing fleet migration.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={generalForm.maintenanceMode}
                  onChange={(e) =>
                    setGeneralForm({ ...generalForm, maintenanceMode: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save General Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: NOTIFICATION SETTINGS */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotifPrefSubmit} className="space-y-6 text-xs max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure internal notification delivery channels and automated driver messaging.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-bold text-slate-900 block">
                      Email Alerts on High-Value Bookings
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Receive automated emails whenever an interstate group booking exceeding ₹5,000 occurs.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.emailNotifications}
                    onChange={(e) =>
                      setNotifPreferences({
                        ...notifPreferences,
                        emailNotifications: e.target.checked
                      })
                    }
                    className="rounded text-primary focus:ring-0 w-4 h-4 mt-1"
                  />
                </label>

                <label className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-bold text-slate-900 block">
                      SMS Shift Alerts to Captains & Drivers
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Send automated SMS dispatch messages to drivers 2 hours prior to scheduled departure.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.smsNotifications}
                    onChange={(e) =>
                      setNotifPreferences({
                        ...notifPreferences,
                        smsNotifications: e.target.checked
                      })
                    }
                    className="rounded text-primary focus:ring-0 w-4 h-4 mt-1"
                  />
                </label>

                <label className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-bold text-slate-900 block">
                      Daily Financial Reconciled Digest
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Send a midnight PDF summary of all UPI, credit card, and net banking collections.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.dailyDigest}
                    onChange={(e) =>
                      setNotifPreferences({
                        ...notifPreferences,
                        dailyDigest: e.target.checked
                      })
                    }
                    className="rounded text-primary focus:ring-0 w-4 h-4 mt-1"
                  />
                </label>

                <label className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-bold text-slate-900 block">
                      Audio Notification Chimes
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Play an audible chime when new reservations arrive while on the dispatch screen.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.soundAlerts}
                    onChange={(e) =>
                      setNotifPreferences({
                        ...notifPreferences,
                        soundAlerts: e.target.checked
                      })
                    }
                    className="rounded text-primary focus:ring-0 w-4 h-4 mt-1"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
