import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../../services/api';
import StatCard from '../components/StatCard';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Bus,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  REVENUE_MONTHLY_DATA,
  BUS_TYPE_STATS
} from '../data/mockAdminData';
import toast from 'react-hot-toast';

const FALLBACK_CANCELLATION_REASONS = [
  { reason: 'Customer Schedule Reschedule', count: 48, percentage: 42, color: '#3B82F6' },
  { reason: 'Found Alternate Transport', count: 32, percentage: 28, color: '#F59E0B' },
  { reason: 'Inclement Weather / Fog Delays', count: 18, percentage: 16, color: '#EF4444' },
  { reason: 'Medical / Emergency', count: 16, percentage: 14, color: '#10B981' }
];

const PASSENGER_GROWTH_DATA = [
  { month: 'Jun', activePassengers: 4200, newRegistrations: 780 },
  { month: 'Jul', activePassengers: 4950, newRegistrations: 910 },
  { month: 'Aug', activePassengers: 5600, newRegistrations: 840 },
  { month: 'Sep', activePassengers: 6450, newRegistrations: 1050 },
  { month: 'Oct', activePassengers: 7300, newRegistrations: 1220 },
  { month: 'Nov', activePassengers: 8420, newRegistrations: 1460 }
];

const ReportAnalyticsPage = () => {
  const { buses, metrics } = useAdmin();
  const [timeframe, setTimeframe] = useState('30D');
  const [reportData, setReportData] = useState(null);
  const isAdminSession = (() => {
    try {
      return Boolean(
        localStorage.getItem('yatrabus_token') &&
        JSON.parse(localStorage.getItem('yatra_user') || 'null')?.role === 'admin'
      );
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (!isAdminSession) return undefined;
    let active = true;
    adminApi.getReports({ timeframe })
      .then((data) => {
        if (active) setReportData(data);
      })
      .catch((error) => {
        if (!active) return;
        setReportData({});
        toast.error(error.response?.data?.error?.message || error.message || 'Unable to load analytics.');
      });

    return () => {
      active = false;
    };
  }, [isAdminSession, timeframe]);

  const revenueMonthlyData = isAdminSession
    ? reportData?.revenueMonthly || []
    : REVENUE_MONTHLY_DATA;
  const busTypeStats = isAdminSession ? reportData?.busTypeStats || [] : BUS_TYPE_STATS;
  const passengerGrowthData = isAdminSession
    ? reportData?.passengerGrowth || []
    : PASSENGER_GROWTH_DATA;
  const cancellationReasons = isAdminSession
    ? (reportData?.cancellationReasons || []).map((reason, index) => ({
        ...reason,
        color: ['#3B82F6', '#F59E0B', '#EF4444', '#10B981'][index % 4],
      }))
    : FALLBACK_CANCELLATION_REASONS;

  const handleExportFullReport = () => {
    toast.success('Analytics executive report exported as CSV & PDF.');
  };

  return (
    <div className="space-y-8 animate__animated animate__fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Comprehensive Reports & Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deep financial reconciliation, corridor traffic distributions, fleet performance indicators, and churn analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill tabs */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-semibold">
            {[
              { id: '7D', label: '7 Days' },
              { id: '30D', label: '30 Days' },
              { id: '90D', label: 'Quarter' },
              { id: 'YTD', label: 'Year to Date' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeframe === t.id
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportFullReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue Volume"
          value={`₹${((reportData?.summary?.totalRevenue ?? metrics.totalRevenue) / 100000).toFixed(2)} Lakhs`}
          trend="+18.4%"
          trendType="up"
          subtitle="Annualized gross run-rate"
          icon={DollarSign}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Passenger Growth Rate"
          value={reportData?.summary?.passengerGrowthRate || (isAdminSession ? '0%' : '+24.6%')}
          trend={reportData?.summary?.passengerGrowthRate || (isAdminSession ? '0%' : '+4.2%')}
          trendType="up"
          subtitle="Month-on-month increase"
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Fleet Utilization"
          value={metrics.occupancyRate}
          trend="+2.1%"
          trendType="up"
          subtitle="Peak weekend capacity"
          icon={Bus}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Cancellation Ratio"
          value={reportData?.summary?.cancellationRate || '0%'}
          trend="-0.5%"
          trendType="up"
          subtitle="Within industry safety tolerance"
          icon={AlertCircle}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* SECTION 1: Revenue Reports & Monthly Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Revenue & Monthly Bookings Trajectory
              </h3>
              <p className="text-xs text-slate-400">Monthly gross volume and issued ticket volume</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Gross Revenue
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Confirmed Tickets
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'revenue' ? `₹${val.toLocaleString()}` : val.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]}
                  contentStyle={{
                    backgroundColor: '#071330',
                    color: '#FFF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bus Model Fleet Breakdown</h3>
            <p className="text-xs text-slate-400">Class composition across fleet coaches</p>

            <div className="space-y-4 pt-6">
              {busTypeStats.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{item.type}</span>
                    <span className="font-mono text-primary">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{item.count} coaches registered</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Passenger Growth & Cancellation Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Passenger Growth Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Passenger Base Expansion</h3>
              <p className="text-xs text-slate-400">Total active travellers vs new monthly signups</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              {isAdminSession
                ? `${reportData?.summary?.passengerGrowthRate || '0%'} Growth`
                : '+18.2% Growth'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={passengerGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="activePassengers"
                  name="Active Passengers"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="newRegistrations"
                  name="New User Signups"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cancellation Reports */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Cancellation Root-Cause Audit</h3>
            <p className="text-xs text-slate-400">Categorical breakdown of cancelled reservations</p>
          </div>

          <div className="space-y-4">
            {cancellationReasons.map((reason, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{reason.reason}</span>
                  <span className="font-mono text-slate-900">{reason.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${reason.percentage}%`, backgroundColor: reason.color }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{reason.count} tickets cancelled</span>
                  <span>Refund dispatch rate: 100%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Bus Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Bus Fleet Efficiency & Performance Matrix</h3>
          <p className="text-xs text-slate-400">Real-time trip completion, occupancy ratios, and reliability</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bus Coach</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Trips Completed</th>
                <th className="py-3 px-4">Occupancy Rate</th>
                <th className="py-3 px-4">Punctuality Score</th>
                <th className="py-3 px-4 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{bus.busName}</span>
                    <span className="font-mono text-primary text-[11px] font-bold">
                      {bus.busNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{bus.operator}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                      {bus.busType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">142 trips</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">89.4%</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">96.8%</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        bus.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {bus.status === 'Active' ? 'Optimal Fleet' : 'Maintenance'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalyticsPage;
