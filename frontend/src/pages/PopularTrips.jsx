import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BusSearchForm from '../components/bus/BusSearchForm';
import { routeApi } from '../services/api';
import {
  Milestone,
  Clock,
  MapPin,
  ArrowRight,
  Bus,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const FALLBACK_POPULAR_ROUTES = [
  {
    id: 'RT-KOL-SIL',
    origin: 'Kolkata',
    destination: 'Siliguri',
    distanceKm: 560,
    estimatedDuration: '10h 30m',
    highwayNumber: 'NH-12',
    baseFare: 890,
    busType: 'Multi-Axle AC Sleeper (2+1)',
    operator: 'YatraBus',
    frequency: '12 daily services',
  },
  {
    id: 'RT-DEL-JAI',
    origin: 'Delhi',
    destination: 'Jaipur',
    distanceKm: 280,
    estimatedDuration: '5h 15m',
    highwayNumber: 'NH-48',
    baseFare: 550,
    busType: 'AC Sleeper (2+1)',
    operator: 'YatraBus',
    frequency: '18 daily services',
  },
  {
    id: 'RT-MUM-PUN',
    origin: 'Mumbai',
    destination: 'Pune',
    distanceKm: 150,
    estimatedDuration: '3h 30m',
    highwayNumber: 'Mumbai-Pune Exp',
    baseFare: 400,
    busType: 'AC Seater (2+2)',
    operator: 'YatraBus',
    frequency: '24 daily services',
  },
  {
    id: 'RT-BLR-CHE',
    origin: 'Bengaluru',
    destination: 'Chennai',
    distanceKm: 345,
    estimatedDuration: '6h 30m',
    highwayNumber: 'NH-48',
    baseFare: 750,
    busType: 'Diamond AC Sleeper (2+1)',
    operator: 'YatraBus',
    frequency: '14 daily services',
  },
  {
    id: 'RT-DEL-MAN',
    origin: 'Delhi',
    destination: 'Manali',
    distanceKm: 535,
    estimatedDuration: '14h 00m',
    highwayNumber: 'NH-3',
    baseFare: 1350,
    busType: 'Premium Volvo 9600 Multi-Axle',
    operator: 'YatraBus',
    frequency: '8 daily services',
  },
  {
    id: 'RT-HYD-BLR',
    origin: 'Hyderabad',
    destination: 'Bengaluru',
    distanceKm: 570,
    estimatedDuration: '9h 15m',
    highwayNumber: 'NH-44',
    baseFare: 950,
    busType: 'Luxury AC Sleeper (2+1)',
    operator: 'YatraBus',
    frequency: '16 daily services',
  },
  {
    id: 'RT-KOL-DIG',
    origin: 'Kolkata',
    destination: 'Digha',
    distanceKm: 185,
    estimatedDuration: '4h 15m',
    highwayNumber: 'NH-116B',
    baseFare: 350,
    busType: 'Express AC Seater (2+2)',
    operator: 'YatraBus',
    frequency: '20 daily services',
  },
  {
    id: 'RT-AHM-MUM',
    origin: 'Ahmedabad',
    destination: 'Mumbai',
    distanceKm: 525,
    estimatedDuration: '9h 15m',
    highwayNumber: 'NH-48',
    baseFare: 800,
    busType: 'Multi-Axle AC Sleeper',
    operator: 'YatraBus',
    frequency: '10 daily services',
  },
];

const PopularTrips = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayISO = new Date().toISOString().split('T')[0];

  const fetchRoutes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await routeApi.getRoutes();
      if (Array.isArray(data) && data.length > 0) {
        setRoutes(
          data.map((r) => ({
            id: r.id || r._id,
            origin: r.origin || r.source,
            destination: r.destination,
            distanceKm: r.distanceKm || parseInt(r.distance) || 300,
            estimatedDuration: r.estimatedDuration || r.duration || '6h 00m',
            highwayNumber: r.highwayNumber || r.highway || 'National Highway',
            baseFare: r.baseFare || r.fare || 650,
            busType: r.busType || 'AC Sleeper (2+1)',
            operator: r.operator || 'YatraBus',
            frequency: r.frequency || 'Daily Scheduled Departures',
          }))
        );
      } else {
        setRoutes(FALLBACK_POPULAR_ROUTES);
      }
    } catch (err) {
      console.warn('Using default routes:', err?.message);
      setRoutes(FALLBACK_POPULAR_ROUTES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleBookRoute = (origin, destination) => {
    navigate(
      `/buses?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(
        destination
      )}&date=${todayISO}`
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Hero Section */}
      <div className="bg-gradient-to-r from-[#1E0B36] via-[#3B0764] to-[#4C0E82] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 shadow-xl relative">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Frequency Corridors</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Popular Intercity Bus Routes
          </h1>
          <p className="text-sm sm:text-base text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Search live bus departures or choose from India's most travelled express corridors. Direct booking, zero booking fees, and live GPS tracked coaches.
          </p>

          {/* Integrated Standard Bus Search Form */}
          <div className="pt-6 max-w-5xl mx-auto text-left">
            <div className="bg-white dark:bg-[#111622] rounded-3xl p-4 sm:p-6 shadow-2xl border border-purple-200/40 dark:border-slate-800">
              <BusSearchForm compact={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Popular Routes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-purple-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Corridors</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Top Travel Corridors by YatraBus
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guaranteed seats • Fixed transparent fares • No surge pricing
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full pt-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Highway & Operator Badge */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-900">
                      {route.highwayNumber}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      {route.distanceKm} km
                    </span>
                  </div>

                  {/* Route Corridor */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      <span>{route.origin}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                      <span>{route.destination}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration: {route.estimatedDuration}</span>
                    </p>
                  </div>

                  {/* Coach Specs */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-primary" />
                      <span>{route.busType}</span>
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ {route.frequency}
                    </p>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Fares From</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      ₹{route.baseFare}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookRoute(route.origin, route.destination)}
                    className="bg-[#9333EA] hover:bg-[#7E22CE] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <span>Book Seats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularTrips;
