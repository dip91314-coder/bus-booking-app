import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  DollarSign,
  Ticket,
  Users,
  Bus,
  Milestone,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  ShieldCheck,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  REVENUE_MONTHLY_DATA,
  BOOKING_STATUS_PIE,
  HIGHWAY_CORRIDOR_METRICS
} from '../data/mockAdminData';

const DashboardPage = () => {
  const { metrics, bookings, buses, routes, cancelBooking } = useAdmin();
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Format currency
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 animate__animated animate__fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Executive Fleet Operations Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics for revenue, bookings, bus assignments, and national transit corridors.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/buses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bus</span>
          </Link>
          <Link
            to="/admin/schedules"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Create Schedule</span>
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatINR(metrics.totalRevenue)}
          trend="+14.2%"
          trendType="up"
          subtitle="vs last month"
          icon={DollarSign}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Bookings"
          value={metrics.totalBookings.toLocaleString()}
          trend="+11.5%"
          trendType="up"
          subtitle="monthly total"
          icon={Ticket}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Total Passengers"
          value={metrics.totalPassengers.toLocaleString()}
          trend="+8.9%"
          trendType="up"
          subtitle="active profiles"
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Buses"
          value={`${metrics.totalBuses} Coaches`}
          subtitle={`${metrics.activeBuses} Active on Road`}
          trendType="neutral"
          icon={Bus}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Active Routes"
          value={`${metrics.activeRoutes} Corridors`}
          subtitle="National Network"
          trend="+2 New"
          trendType="up"
          icon={Milestone}
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Pending Bookings"
          value={metrics.pendingBookings}
          subtitle="Awaiting Gateway"
          trend={metrics.pendingBookings > 0 ? 'Requires action' : 'All clear'}
          trendType={metrics.pendingBookings > 0 ? 'down' : 'up'}
          icon={Clock}
          iconBg="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Analytics (AreaChart) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Analytics</h3>
              <p className="text-xs text-slate-400">Monthly gross transaction volume trend</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <span className="w-3 h-3 rounded-md bg-blue-600 inline-block"></span>
                Gross GTV (₹)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#071330',
                    color: '#FFF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: 'none'
                  }}
                  itemStyle={{ color: '#93C5FD' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Statistics (BarChart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Booking Statistics</h3>
              <p className="text-xs text-slate-400">Monthly tickets booked vs passengers</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              H2 2026
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071330',
                    color: '#FFF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="bookings" name="Tickets Booked" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passengers" name="Passengers" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Popular Routes & Booking Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Popular Routes Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Popular Interstate Routes</h3>
              <p className="text-xs text-slate-400">Top revenue generating highway corridors</p>
            </div>
            <Link
              to="/admin/routes"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {HIGHWAY_CORRIDOR_METRICS.map((corridor, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/40 transition">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{corridor.corridor}</span>
                  </div>
                  <span className="font-mono text-primary font-black">
                    {formatINR(corridor.revenue)}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full"
                    style={{ width: `${corridor.occupancy}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>{corridor.trips} completed trips</span>
                  <span className="font-semibold text-emerald-600">
                    {corridor.occupancy}% average seat occupancy
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Booking Status Ratio</h3>
            <p className="text-xs text-slate-400">Distribution across active transactions</p>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={BOOKING_STATUS_PIE}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {BOOKING_STATUS_PIE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Ratio']}
                    contentStyle={{
                      backgroundColor: '#071330',
                      color: '#FFF',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            {BOOKING_STATUS_PIE.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 font-medium truncate">{item.name}</span>
                <span className="font-bold text-slate-900 font-mono ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Real-Time Bookings</h3>
            <p className="text-xs text-slate-400">Latest tickets issued across all booking terminals</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View Full Booking Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Booking PNR</th>
                <th className="py-3 px-4">Passenger Details</th>
                <th className="py-3 px-4">Bus Operator</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Journey Date</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{b.pnr}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{b.passengerName}</span>
                    <span className="text-[11px] text-slate-400">{b.passengerPhone}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{b.operator}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {b.source} ➔ {b.destination}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{b.journeyDate}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">
                    {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}
                  </td>
                  <td className="py-3.5 px-4 font-black font-sans text-slate-900">
                    ₹{b.totalAmount || b.fare}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.bookingStatus === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.bookingStatus === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition"
                      title="View Booking Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Quick View Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details: ${selectedBooking.pnr}`}
          subtitle={`Booked on ${new Date(selectedBooking.bookedAt).toLocaleString()}`}
        >
          <div className="space-y-6 text-xs">
            {/* Status Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Booking Status
                </span>
                <span className="text-base font-black text-slate-900">
                  {selectedBooking.bookingStatus}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Payment
                </span>
                <span className="font-bold text-emerald-600">
                  {selectedBooking.paymentStatus} ({selectedBooking.paymentMethod})
                </span>
              </div>
            </div>

            {/* Travel info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Route Corridor
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedBooking.source} ➔ {selectedBooking.destination}
                </p>
                <p className="text-slate-500 font-mono">
                  {selectedBooking.departureTime} - {selectedBooking.arrivalTime}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Bus Coach
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedBooking.busName}</p>
                <p className="text-primary font-mono font-semibold">
                  {selectedBooking.busNumber} • {selectedBooking.operator}
                </p>
              </div>
            </div>

            {/* Passenger & Seats */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Manifested Passengers</h4>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Lead Contact: {selectedBooking.passengerName}</span>
                  <span className="font-mono text-slate-500">{selectedBooking.passengerPhone}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
                  <span>Seats Assigned:</span>
                  <span className="font-bold text-primary font-mono">
                    {Array.isArray(selectedBooking.seats)
                      ? selectedBooking.seats.join(', ')
                      : selectedBooking.seats}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Fare */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-sm">
              <span className="font-bold text-slate-800">Total Fare Collected</span>
              <span className="text-lg font-black text-primary font-sans">
                ₹{selectedBooking.totalAmount || selectedBooking.fare}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {selectedBooking.bookingStatus === 'Confirmed' && (
                <button
                  type="button"
                  onClick={() => {
                    cancelBooking(selectedBooking.id);
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                >
                  Cancel Booking & Refund
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;
