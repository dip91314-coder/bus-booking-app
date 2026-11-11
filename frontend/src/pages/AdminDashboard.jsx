import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_ADMIN_METRICS, BUS_OPERATORS } from '../data/mockData';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Bus,
  DollarSign,
  Ticket,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  BarChart3,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { buses, addBus, updateBus, deleteBus, bookings } = useBooking();

  const [activeSection, setActiveSection] = useState('overview'); // overview, buses, routes, bookings, users
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Add Bus Modal State
  const [addBusModalOpen, setAddBusModalOpen] = useState(false);
  const [newBusForm, setNewBusForm] = useState({
    busNumber: 'WB-01-AX-9999',
    busName: 'Bengal Express Volvo B11R',
    operator: 'Greenline Express',
    busType: 'AC Sleeper (2+1)',
    origin: 'Kolkata',
    destination: 'Siliguri',
    departureTime: '19:30',
    arrivalTime: '06:00',
    journeyDuration: '10h 30m',
    fare: 1050,
    totalSeats: 36,
    isActive: true
  });

  const handleAddBusSubmit = (e) => {
    e.preventDefault();
    if (!newBusForm.busNumber || !newBusForm.operator || !newBusForm.origin || !newBusForm.destination) {
      toast.error('Please complete all required fields.');
      return;
    }

    addBus({
      ...newBusForm,
      boardingPoints: [
        { id: 'bp-new-1', name: `${newBusForm.origin} Central Terminal`, time: newBusForm.departureTime, landmark: 'Main Gate' }
      ],
      droppingPoints: [
        { id: 'dp-new-1', name: `${newBusForm.destination} Terminal Hub`, time: newBusForm.arrivalTime, landmark: 'Platform 1' }
      ],
      amenities: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Live GPS']
    });

    setAddBusModalOpen(false);
  };

  // Filtered bus list
  const filteredBuses = buses.filter((b) =>
    b.busName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.operator.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.busNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.origin.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.destination.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Filtered bookings audit
  const auditBookings = bookings.filter((b) => {
    const matchSearch =
      b.pnr.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.operator.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (b.passengers?.[0]?.name && b.passengers[0].name.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchDate = dateFilter ? b.journeyDate === dateFilter : true;
    return matchSearch && matchDate;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      {/* Admin Top Banner */}
      <div className="bg-[#071A4D] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-accent border border-accent/30 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Fleet & Operations Control Portal
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Role: Super Admin
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Centralized management for routes, schedules, fares, and real-time passenger manifests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-blue-300">Logged in as:</span>
            <strong className="text-white font-bold">{user?.email || 'admin@bharatbus.com'}</strong>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-gray-200 mb-8">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'buses', label: 'Manage Bus Fleet', count: buses.length, icon: <Bus className="w-4 h-4" /> },
            { id: 'bookings', label: 'Bookings Audit Log', count: bookings.length, icon: <Ticket className="w-4 h-4" /> },
            { id: 'routes', label: 'Routes & Schedules', icon: <Layers className="w-4 h-4" /> },
            { id: 'users', label: 'Registered Users', count: MOCK_ADMIN_METRICS.registeredUsers, icon: <Users className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSection(tab.id);
                setSearchFilter('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeSection === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeSection === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* SECTION 1: DASHBOARD OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-8 animate__animated animate__fadeIn">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Platform Bookings',
                  value: MOCK_ADMIN_METRICS.totalBookings.toLocaleString(),
                  sub: '+12.5% vs last month',
                  icon: <Ticket className="w-6 h-6 text-primary" />,
                  bg: 'bg-blue-50 text-primary'
                },
                {
                  title: 'Demonstration Revenue',
                  value: MOCK_ADMIN_METRICS.totalRevenue,
                  sub: 'Simulated Gross GTV',
                  icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
                  bg: 'bg-emerald-50 text-emerald-700'
                },
                {
                  title: 'Active Buses on Road',
                  value: `${buses.length} Coaches`,
                  sub: 'Across 18 interstate corridors',
                  icon: <Bus className="w-6 h-6 text-accent" />,
                  bg: 'bg-orange-50 text-accent'
                },
                {
                  title: 'Fleet Occupancy Rate',
                  value: MOCK_ADMIN_METRICS.occupancyRate,
                  sub: 'Peak weekend average',
                  icon: <Users className="w-6 h-6 text-indigo-600" />,
                  bg: 'bg-indigo-50 text-indigo-700'
                }
              ].map((card, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                      {card.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 font-sans">{card.value}</h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{card.sub}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Charts & Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Revenue by Highway Corridors */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Highest Revenue Highway Corridors
                  </h3>
                  <span className="text-xs font-semibold text-gray-400">Current Month</span>
                </div>

                <div className="space-y-4 pt-2">
                  {MOCK_ADMIN_METRICS.revenueByRoute.map((item, idx) => {
                    const widthPct = Math.round((item.bookings / 4210) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                          <span>{item.route}</span>
                          <span className="text-primary font-mono">{item.revenue}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full"
                            style={{ width: `${widthPct}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {item.bookings.toLocaleString()} tickets sold
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Real-Time Booking Stream */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900">Live Booking Feed</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Live Stream
                  </span>
                </div>

                <div className="space-y-3">
                  {MOCK_ADMIN_METRICS.recentBookings.map((b) => (
                    <div
                      key={b.pnr}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">{b.pnr}</span>
                          <span className="font-extrabold text-gray-900">{b.customer}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{b.route}</p>
                        <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          Seats: {b.seats}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-900 font-mono block">{b.fare}</span>
                        <span className="text-[10px] text-gray-400">{b.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MANAGE BUS FLEET (CRUD) */}
        {activeSection === 'buses' && (
          <div className="space-y-6 animate__animated animate__fadeIn">
            {/* Action Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bus name, number, operator, or city..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="button"
                onClick={() => setAddBusModalOpen(true)}
                className="bg-accent hover:bg-accent-hover text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Bus to Fleet</span>
              </button>
            </div>

            {/* Buses Table */}
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Bus Number</th>
                      <th className="py-3 px-4 font-bold">Operator & Name</th>
                      <th className="py-3 px-4 font-bold">Type</th>
                      <th className="py-3 px-4 font-bold">Route</th>
                      <th className="py-3 px-4 font-bold">Timings</th>
                      <th className="py-3 px-4 font-bold">Fare</th>
                      <th className="py-3 px-4 font-bold">Seats</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {filteredBuses.map((bus) => (
                      <tr key={bus.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{bus.busNumber}</td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-gray-900 block">{bus.operator}</span>
                          <span className="text-[11px] text-gray-400">{bus.busName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-50 text-primary font-semibold px-2 py-0.5 rounded text-[11px]">
                            {bus.busType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {bus.origin} ➔ {bus.destination}
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono">
                          {bus.departureTime} - {bus.arrivalTime}
                        </td>
                        <td className="py-3 px-4 font-black text-gray-900 font-sans">₹{bus.fare}</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">
                          {bus.availableSeatsCount || 15} / {bus.totalSeats || 36}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newFare = prompt('Enter updated fare for this bus:', bus.fare);
                                if (newFare && !isNaN(newFare)) {
                                  updateBus(bus.id, { fare: Number(newFare) });
                                }
                              }}
                              className="text-gray-400 hover:text-primary transition p-1"
                              title="Edit bus fare"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${bus.busName} (${bus.busNumber}) from active schedules?`)) {
                                  deleteBus(bus.id);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition p-1"
                              title="Delete bus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: BOOKINGS AUDIT LOG */}
        {activeSection === 'bookings' && (
          <div className="space-y-6 animate__animated animate__fadeIn">
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search PNR or customer name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date:
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => setDateFilter('')}
                    className="text-xs text-red-500 hover:underline font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Booking PNR</th>
                      <th className="py-3 px-4 font-bold">Customer Details</th>
                      <th className="py-3 px-4 font-bold">Bus Operator</th>
                      <th className="py-3 px-4 font-bold">Route</th>
                      <th className="py-3 px-4 font-bold">Journey Date</th>
                      <th className="py-3 px-4 font-bold">Seats</th>
                      <th className="py-3 px-4 font-bold">Fare Paid</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {auditBookings.map((b) => (
                      <tr key={b.pnr} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-mono font-black text-primary">{b.pnr}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900 block">
                            {b.passengers?.[0]?.name || 'Rahul Sen'}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {b.contactPhone || '9876543210'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{b.operator}</td>
                        <td className="py-3 px-4 font-semibold">
                          {b.origin} ➔ {b.destination}
                        </td>
                        <td className="py-3 px-4 font-mono">{b.journeyDate}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          {b.seats?.join(', ')}
                        </td>
                        <td className="py-3 px-4 font-black font-sans">₹{b.totalFare}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.bookingStatus === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {b.bookingStatus?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: ROUTES & SCHEDULES */}
        {activeSection === 'routes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-4 animate__animated animate__fadeIn">
            <h3 className="text-base font-extrabold text-gray-900">
              Nationwide Master Interstate Routes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                { corridor: 'Kolkata - Siliguri (NH-12 / NH-27)', dist: '560 km', duration: '10h 30m', fare: '₹890', buses: 14 },
                { corridor: 'Delhi - Jaipur (NH-48)', dist: '280 km', duration: '5h 15m', fare: '₹450', buses: 38 },
                { corridor: 'Mumbai - Pune Expressway', dist: '150 km', duration: '3h 30m', fare: '₹350', buses: 52 },
                { corridor: 'Bengaluru - Chennai (NH-48)', dist: '345 km', duration: '6h 30m', fare: '₹550', buses: 26 },
                { corridor: 'Delhi - Manali (NH-3 Scenic)', dist: '535 km', duration: '14h 00m', fare: '₹1,250', buses: 18 },
                { corridor: 'Hyderabad - Bengaluru (NH-44)', dist: '570 km', duration: '8h 30m', fare: '₹950', buses: 22 }
              ].map((r, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-extrabold text-xs text-gray-900">{r.corridor}</h4>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Distance: {r.dist}</span>
                    <span>Duration: {r.duration}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 text-xs font-bold">
                    <span className="text-primary">{r.buses} Daily Schedules</span>
                    <span className="text-accent">From {r.fare}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: REGISTERED USERS */}
        {activeSection === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-4 animate__animated animate__fadeIn">
            <h3 className="text-base font-extrabold text-gray-900">Registered Platform Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">User Name</th>
                    <th className="py-2.5 px-4 font-bold">Email</th>
                    <th className="py-2.5 px-4 font-bold">Phone</th>
                    <th className="py-2.5 px-4 font-bold">Role</th>
                    <th className="py-2.5 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {[
                    { name: 'Rahul Sen', email: 'rahul@yatra.com', phone: '+91 9876543210', role: 'Passenger', status: 'Active' },
                    { name: 'Sunita Banerjee', email: 'sunita.b@gmail.com', phone: '+91 9876543211', role: 'Passenger', status: 'Active' },
                    { name: 'Vikram Das', email: 'admin@bharatbus.com', phone: '+91 9811223344', role: 'Super Admin', status: 'Active' },
                    { name: 'Arjun Sharma', email: 'arjun.s@yahoo.com', phone: '+91 9822334455', role: 'Passenger', status: 'Active' }
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-bold">{u.name}</td>
                      <td className="py-2.5 px-4 font-mono">{u.email}</td>
                      <td className="py-2.5 px-4">{u.phone}</td>
                      <td className="py-2.5 px-4 font-bold text-primary">{u.role}</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-600">{u.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Bus Modal */}
      {addBusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate__animated animate__zoomIn">
            <h3 className="text-lg font-black text-gray-900 pb-2 border-b">
              Add New Bus to Fleet
            </h3>

            <form onSubmit={handleAddBusSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Registration No.
                  </label>
                  <input
                    type="text"
                    value={newBusForm.busNumber}
                    onChange={(e) => setNewBusForm({ ...newBusForm, busNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border font-mono"
                    placeholder="WB-04-A-1234"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Bus Name / Fleet Label
                  </label>
                  <input
                    type="text"
                    value={newBusForm.busName}
                    onChange={(e) => setNewBusForm({ ...newBusForm, busName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Fleet Operator
                  </label>
                  <select
                    value={newBusForm.operator}
                    onChange={(e) => setNewBusForm({ ...newBusForm, operator: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-white"
                  >
                    {BUS_OPERATORS.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Bus Category
                  </label>
                  <select
                    value={newBusForm.busType}
                    onChange={(e) => setNewBusForm({ ...newBusForm, busType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-white"
                  >
                    <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                    <option value="Multi-Axle AC Seater (2+2)">Multi-Axle AC Seater (2+2)</option>
                    <option value="Non-AC Seater">Non-AC Seater</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Origin City</label>
                  <input
                    type="text"
                    value={newBusForm.origin}
                    onChange={(e) => setNewBusForm({ ...newBusForm, origin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Destination City</label>
                  <input
                    type="text"
                    value={newBusForm.destination}
                    onChange={(e) => setNewBusForm({ ...newBusForm, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Departure</label>
                  <input
                    type="time"
                    value={newBusForm.departureTime}
                    onChange={(e) => setNewBusForm({ ...newBusForm, departureTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Arrival</label>
                  <input
                    type="time"
                    value={newBusForm.arrivalTime}
                    onChange={(e) => setNewBusForm({ ...newBusForm, arrivalTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Fare (₹)</label>
                  <input
                    type="number"
                    value={newBusForm.fare}
                    onChange={(e) => setNewBusForm({ ...newBusForm, fare: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border font-bold text-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAddBusModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-md"
                >
                  Confirm & Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

