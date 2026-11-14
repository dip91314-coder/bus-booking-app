import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import BusCard from '../components/bus/BusCard';
import BusFilters from '../components/bus/BusFilters';
import BusSearchForm from '../components/bus/BusSearchForm';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  MapPin,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Bus
} from 'lucide-react';

const SearchResults = () => {
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  const { buses, searchParams, setSearchParams } = useBooking();

  const originQuery = urlParams.get('origin') || searchParams.origin || 'Kolkata';
  const destQuery = urlParams.get('destination') || searchParams.destination || 'Siliguri';
  const dateQuery = urlParams.get('date') || searchParams.journeyDate || new Date().toISOString().split('T')[0];

  const [showModifySearch, setShowModifySearch] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('price-asc'); // price-asc, duration-asc, departure-asc, rating-desc

  // Filter state
  const [filters, setFilters] = useState({
    busTypes: [],
    timeSlots: [],
    maxPrice: 2500,
    operators: [],
    minRating: 0
  });

  const handleResetFilters = () => {
    setFilters({
      busTypes: [],
      timeSlots: [],
      maxPrice: 2500,
      operators: [],
      minRating: 0
    });
  };

  // Filter & Sort Logic
  const filteredBuses = useMemo(() => {
    // 1. Route match (or relaxed if viewing all)
    let list = buses.filter((bus) => {
      const matchOrigin = bus.origin.toLowerCase().includes(originQuery.toLowerCase());
      const matchDest = bus.destination.toLowerCase().includes(destQuery.toLowerCase());
      return matchOrigin && matchDest;
    });

    // If zero match on exact query, provide all buses with a clear banner
    const isExactMatch = list.length > 0;
    if (!isExactMatch) {
      list = buses; // fallback to demonstrate UI
    }

    // 2. Bus type filter
    if (filters.busTypes.length > 0) {
      list = list.filter((b) =>
        filters.busTypes.some((t) => b.busType.toLowerCase().includes(t.toLowerCase()))
      );
    }

    // 3. Operators filter
    if (filters.operators.length > 0) {
      list = list.filter((b) => filters.operators.includes(b.operator));
    }

    // 4. Max price filter
    if (filters.maxPrice) {
      list = list.filter((b) => b.fare <= filters.maxPrice);
    }

    // 5. Min rating filter
    if (filters.minRating > 0) {
      list = list.filter((b) => b.rating >= filters.minRating);
    }

    // 6. Time slots
    if (filters.timeSlots.length > 0) {
      list = list.filter((b) => {
        const hour = parseInt(b.departureTime.split(':')[0], 10);
        return filters.timeSlots.some((slot) => {
          if (slot === 'morning') return hour >= 6 && hour < 12;
          if (slot === 'afternoon') return hour >= 12 && hour < 18;
          if (slot === 'evening') return hour >= 18 && hour <= 23;
          if (slot === 'night') return hour >= 0 && hour < 6;
          return true;
        });
      });
    }

    // 7. Sorting
    list.sort((a, b) => {
      if (sortBy === 'price-asc') return a.fare - b.fare;
      if (sortBy === 'price-desc') return b.fare - a.fare;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'departure-asc') return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });

    return { list, isExactMatch };
  }, [buses, originQuery, destQuery, filters, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Route Ribbon */}
      <div className="bg-[#3B0764] dark:bg-[#150A2A] text-white py-6 px-4 sm:px-6 lg:px-8 shadow-md transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-200 mb-1">
              <span>Home</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Bus Search</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-bold">{originQuery} to {destQuery}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{originQuery}</span>
                <span className="text-amber-400">➔</span>
                <span>{destQuery}</span>
              </h1>
              <span className="text-xs bg-white/10 text-purple-100 px-3 py-1 rounded-full font-semibold border border-white/20">
                {dateQuery}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowModifySearch(!showModifySearch)}
              className="bg-[#7E22CE] hover:bg-[#6B21A8] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{showModifySearch ? 'Close Search' : 'Modify Search'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Collapsible Modify Search Drawer */}
        {showModifySearch && (
          <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-purple-400/30">
            <BusSearchForm compact onSearchComplete={() => setShowModifySearch(false)} />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <BusFilters
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end lg:hidden">
              <div className="w-80 bg-white dark:bg-[#111622] h-full p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-slate-800">
                  <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="text-gray-500 dark:text-slate-400 font-bold p-1 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>
                <BusFilters
                  filters={filters}
                  setFilters={setFilters}
                  onReset={handleResetFilters}
                />
              </div>
            </div>
          )}

          {/* Bus Results List Column */}
          <div className="lg:col-span-9 space-y-4">
            {/* Sorting & Result Count Bar */}
            <div className="bg-white dark:bg-[#111622] rounded-2xl p-4 shadow-card border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <div>
                <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {filteredBuses.list.length} Buses Available
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-400">
                  Showing buses for {originQuery} ➔ {destQuery}
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-primary dark:text-purple-400" /> Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="price-asc" className="dark:bg-[#111622]">Cheapest First (Price Low ➔ High)</option>
                  <option value="price-desc" className="dark:bg-[#111622]">Price (High ➔ Low)</option>
                  <option value="departure-asc" className="dark:bg-[#111622]">Departure (Earliest First)</option>
                  <option value="rating-desc" className="dark:bg-[#111622]">Highest Customer Rating</option>
                </select>
              </div>
            </div>

            {/* In case no exact route found notice */}
            {!filteredBuses.isExactMatch && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Showing All Active Indian Bus Schedules</h4>
                  <p className="mt-0.5">
                    No direct buses were scheduled strictly between <strong>{originQuery}</strong> and{' '}
                    <strong>{destQuery}</strong> for this date. We've listed other active intercity bus options across India below so you can explore and book.
                  </p>
                </div>
              </div>
            )}

            {/* Bus Cards List */}
            {filteredBuses.list.length > 0 ? (
              <div className="space-y-4">
                {filteredBuses.list.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-12 text-center shadow-card border border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-primary dark:text-purple-400 flex items-center justify-center mx-auto">
                  <Bus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Buses Match Your Active Filters</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                  Try widening your price range, deselecting time slots, or resetting all filters to see more buses.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

