import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Bus,
  Milestone,
  CalendarClock,
  Ticket,
  Users,
  Contact2,
  Briefcase,
  CreditCard,
  Percent,
  Star,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Search,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User
} from 'lucide-react';

const AdminLayout = () => {
  const { notifications, unreadNotificationsCount, markAsRead, markAllAsRead, settings } = useAdmin();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Grouped Navigation Modules
  const navSections = [
    {
      label: 'MAIN',
      items: [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }
      ]
    },
    {
      label: 'FLEET & OPERATIONS',
      items: [
        { path: '/admin/buses', label: 'Bus Management', icon: Bus },
        { path: '/admin/routes', label: 'Route Management', icon: Milestone },
        { path: '/admin/schedules', label: 'Schedule Management', icon: CalendarClock }
      ]
    },
    {
      label: 'BOOKINGS & PEOPLE',
      items: [
        { path: '/admin/bookings', label: 'Booking Management', icon: Ticket },
        { path: '/admin/passengers', label: 'Passenger Management', icon: Users },
        { path: '/admin/drivers', label: 'Driver Management', icon: Contact2 },
        { path: '/admin/staff', label: 'Staff Management', icon: Briefcase }
      ]
    },
    {
      label: 'COMMERCE & RELATIONS',
      items: [
        { path: '/admin/payments', label: 'Payment Management', icon: CreditCard },
        { path: '/admin/offers', label: 'Offers & Discounts', icon: Percent },
        { path: '/admin/reviews', label: 'Reviews & Feedback', icon: Star }
      ]
    },
    {
      label: 'SYSTEM & INSIGHTS',
      items: [
        { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
        {
          path: '/admin/notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
        },
        { path: '/admin/settings', label: 'Admin Settings', icon: Settings }
      ]
    }
  ];

  // Helper for active route check
  const isRouteActive = (itemPath, exact) => {
    if (exact) {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#071330] text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#050E24]">
          <Link
            to="/admin"
            className="flex items-center gap-3 overflow-hidden text-white group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 group-hover:scale-105 transition">
              <Bus className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white">
                    BharatBus
                  </span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30">
                    Ops
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  Enterprise Control Panel
                </span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status indicator */}
        {!collapsed && (
          <div className="px-4 py-2.5 bg-blue-950/40 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-300">Fleet Cloud Sync</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE</span>
          </div>
        )}

        {/* Nav Links Container */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {sec.label}
                </div>
              )}
              {sec.items.map((item) => {
                const active = isRouteActive(item.path, item.exact);
                const IconComponent = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setMobileMenuOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                      active
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        active ? 'text-white' : 'text-slate-400 group-hover:scale-110'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {/* Badge */}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}

                    {collapsed && item.badge && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                    )}

                    {/* Active Pip when collapsed */}
                    {collapsed && active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800/80 bg-[#050E24] flex items-center justify-between gap-2">
          {!collapsed ? (
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition"
              title="Visit Customer Booking Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              title="Customer Portal"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb location */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400">Admin Control</span>
              <span className="text-slate-300">/</span>
              <span className="text-primary font-bold capitalize">
                {location.pathname.replace('/admin', '').replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Header Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Site Shortcut */}
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Live Site</span>
            </Link>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                title="System Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden animate__animated animate__fadeIn animate__faster"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        {unreadNotificationsCount} unread
                      </span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 text-xs flex gap-3 hover:bg-slate-50 cursor-pointer transition ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            n.category === 'booking'
                              ? 'bg-blue-100 text-blue-600'
                              : n.category === 'payment'
                              ? 'bg-emerald-100 text-emerald-600'
                              : n.category === 'cancellation'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {n.category === 'cancellation' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                    <Link
                      to="/admin/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View All System Alerts ➔
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {settings.adminName?.split(' ').map((n) => n[0]).join('') || 'VD'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {settings.adminName || 'Vikram Das'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {settings.adminRole || 'Super Admin'}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 p-2 animate__animated animate__fadeIn animate__faster text-xs font-semibold"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-slate-900 font-bold">{settings.adminName}</p>
                    <p className="text-[11px] text-slate-400 font-normal truncate">
                      {settings.adminEmail}
                    </p>
                  </div>

                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Customer Portal</span>
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT OUTLET */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* ADMIN FOOTER */}
        <footer className="px-6 py-4 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>BharatBus Enterprise Operations</strong>. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              API Server Online
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-400">v2.4.0-stable</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
