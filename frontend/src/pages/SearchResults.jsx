import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { tripApi } from '../services/api';
import BusCard from '../components/bus/BusCard';
import BusFilters from '../components/bus/BusFilters';
import BusSearchForm from '../components/bus/BusSearchForm';
import { getAvailableSeatCount, normalizeYatraFleetItems } from '../utils/yatraFleet';
import { TripCardSkeleton } from '../components/common/Skeletons';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  MapPin,
  ChevronRight,
  RefreshCw,
  Bus,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';

const SearchResults = () => {
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  const { buses, searchParams, setSearchParams } = useBooking();

  const originQuery = urlParams.get('from') || urlParams.get('origin') || searchParams.origin || 'Kolkata';
  const destQuery = urlParams.get('to') || urlParams.get('destination') || searchParams.destination || 'Siliguri';
  const dateQuery = urlParams.get('date') || searchParams.journeyDate || new Date().toISOString().split('T')[0];

  const [liveTrips, setLiveTrips] = useState(null);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [showModifySearch, setShowModifySearch] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('price-asc'); // price-asc, duration-asc, departure-asc, rating-desc
  const [searchText, setSearchText] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [availabilityUpdatedAt, setAvailabilityUpdatedAt] = useState(null);
  const liveRefreshEnabled = useRef(false);

  const dynamicMaxPrice = useMemo(() => {
    const sourcePool = liveTrips && liveTrips.length > 0 ? liveTrips : buses;
    const fares = sourcePool.map((b) => b.fare || 0).filter((f) => f > 0);
    return fares.length > 0 ? Math.max(...fares) : 2500;
  }, [liveTrips, buses]);

  const refreshTrips = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoadingTrips(true);

    try {
      const trips = await tripApi.searchTrips({
        from: originQuery,
        to: destQuery,
        date: dateQuery
      });

      if (Array.isArray(trips) && trips.length > 0) {
        setLiveTrips(normalizeYatraFleetItems(trips));
        liveRefreshEnabled.current = true;
        setAvailabilityUpdatedAt(new Date());
      } else {
        setLiveTrips(null);
        liveRefreshEnabled.current = false;
        setAvailabilityUpdatedAt(null);
      }
    } catch (err) {
      console.warn('Could not query live trips, using inventory:', err?.message);
      setLiveTrips(null);
      liveRefreshEnabled.current = false;
      setAvailabilityUpdatedAt(null);
    } finally {
      if (showLoading) setIsLoadingTrips(false);
    }
  }, [originQuery, destQuery, dateQuery]);

  useEffect(() => {
    let active = true;
    const loadTrips = async (options) => {
      if (active) await refreshTrips(options);
    };

    loadTrips();
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && liveRefreshEnabled.current) {
        loadTrips({ showLoading: false });
      }
    }, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [refreshTrips]);

  const [filters, setFilters] = useState({
    busTypes: [],
    timeSlots: [],
    maxPrice: dynamicMaxPrice,
    minRating: 0
  });

  const handleResetFilters = () => {
    setFilters({
      busTypes: [],
      timeSlots: [],
      maxPrice: dynamicMaxPrice,
      minRating: 0
    });
    setSearchText('');
    setAvailableOnly(false);
  };

  // Filter & Sort Logic
  const filteredBuses = useMemo(() => {
    const sourcePool = liveTrips && liveTrips.length > 0 ? liveTrips : buses;

    // 1. Route match (or relaxed if viewing all)
    let list = sourcePool.filter((bus) => {
      const matchOrigin = (bus.origin || bus.source || '').toLowerCase().includes(originQuery.toLowerCase());
      const matchDest = (bus.destination || '').toLowerCase().includes(destQuery.toLowerCase());
      return matchOrigin && matchDest;
    });

    const isExactMatch = list.length > 0;

    // 2. Bus type filter
    if (filters.busTypes.length > 0) {
      list = list.filter((b) =>
        filters.busTypes.some((t) => b.busType.toLowerCase().includes(t.toLowerCase()))
      );
    }

    // 3. Max price filter
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

    const query = searchText.trim().toLowerCase();
    if (query) {
      list = list.filter((bus) => {
        const searchableValues = [
          bus.busName,
          bus.busType,
          bus.origin,
          bus.destination,
          ...(bus.amenities || []),
          ...(bus.boardingPoints || []).map((point) => point.name),
          ...(bus.droppingPoints || []).map((point) => point.name)
        ];
        return searchableValues.some((value) => String(value || '').toLowerCase().includes(query));
      });
    }

    if (availableOnly) {
      list = list.filter((bus) => getAvailableSeatCount(bus) > 0);
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
  }, [buses, liveTrips, originQuery, destQuery, filters, sortBy, searchText, availableOnly]);

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
              maxPrice={dynamicMaxPrice}
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
                  maxPrice={dynamicMaxPrice}
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

            <div className="rounded-2xl border border-purple-100 dark:border-purple-900/50 bg-gradient-to-r from-white to-purple-50/70 dark:from-[#111622] dark:to-purple-950/20 p-4 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-3">
                <label className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search bus type, amenities, or boarding point"
                    aria-label="Search buses by type, amenities, or boarding point"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161D2E] py-2.5 pl-10 pr-10 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/50"
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      aria-label="Clear search text"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </label>
                <button
                  type="button"
                  aria-pressed={availableOnly}
                  onClick={() => setAvailableOnly((current) => !current)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                    availableOnly
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-[#161D2E] dark:text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Seats available
                </button>
                <button
                  type="button"
                  onClick={() => refreshTrips()}
                  disabled={isLoadingTrips}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B21B6] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4C1D95] disabled:cursor-wait disabled:opacity-70"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingTrips ? 'animate-spin' : ''}`} />
                  Refresh availability
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400" role="status" aria-live="polite">
                {availabilityUpdatedAt
                  ? `Live YatraBus availability · updated ${availabilityUpdatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                  : 'Showing YatraBus inventory · refresh to check for updated seats'}
              </p>
            </div>

            {/* Bus Cards List */}
            {isLoadingTrips ? (
              <div className="space-y-4">
                <TripCardSkeleton />
                <TripCardSkeleton />
                <TripCardSkeleton />
              </div>
            ) : !filteredBuses.isExactMatch ? (
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-12 text-center shadow-card border border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-primary dark:text-purple-400 flex items-center justify-center mx-auto">
                  <Bus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Buses Are Scheduled</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                  No buses are scheduled from <strong>{originQuery}</strong> to <strong>{destQuery}</strong> on {dateQuery}.
                </p>
              </div>
            ) : filteredBuses.list.length > 0 ? (
              <div className="space-y-4">
                {filteredBuses.list.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111622] rounded-3xl p-12 text-center shadow-card border border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-[#5B21B6] dark:text-purple-400 flex items-center justify-center mx-auto">
                  <Bus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Buses Match Your Active Filters</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                  {searchText ? (
                    <>No buses match "<strong className="text-gray-900 dark:text-white">{searchText}</strong>". Try clearing your search keyword or resetting filters to see all available buses.</>
                  ) : (
                    <>Try widening your price range, deselecting time slots, or resetting all filters to see more buses.</>
                  )}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText('')}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

