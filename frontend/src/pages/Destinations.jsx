import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinationApi } from '../services/api';
import { INITIAL_DESTINATIONS } from '../data/destinationsData';
import TravelImage from '../components/common/TravelImage';
import { DestinationCardSkeleton } from '../components/common/Skeletons';
import { MapPin, Search, ArrowRight, Sparkles, Filter, AlertCircle, RefreshCw } from 'lucide-react';

const Destinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState(INITIAL_DESTINATIONS);
  const [filter, setFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDestinations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await destinationApi.getDestinations();
      if (Array.isArray(data) && data.length > 0) {
        setDestinations(data);
      }
    } catch (err) {
      console.warn('Live API destinations fetch warning, using verified dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const tags = ['All', 'Heritage', 'Hill Station', 'Beach', 'Spiritual', 'Pilgrimage'];

  const filtered = destinations.filter((d) => {
    const matchesText =
      (d.name || '').toLowerCase().includes(filter.toLowerCase()) ||
      (d.state || '').toLowerCase().includes(filter.toLowerCase()) ||
      (d.title || '').toLowerCase().includes(filter.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(filter.toLowerCase());
    const matchesTag = selectedTag === 'All' || d.tag === selectedTag;
    return matchesText && matchesTag;
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero with proper top breathing space */}
      <div className="bg-gradient-to-r from-[#071A4D] via-[#0C247A] to-primary text-white pt-14 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 text-center shadow-lg relative">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Bus Destinations</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Discover Incredible India by Bus
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Explore direct intercity routes connecting legendary heritage citadels, serene coastal shores, misty Himalayan passes, and sacred river ghats.
          </p>

          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by city, state, or attraction..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-gray-900 text-xs font-bold placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-400/30 scale-105 border border-amber-300'
                    : 'bg-white/15 text-white hover:bg-white/25 hover:text-amber-200 border border-white/25 backdrop-blur-sm active:scale-95'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {isLoading && destinations.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Unable to Load Destinations</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
            <button
              type="button"
              onClick={fetchDestinations}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm font-semibold">No destinations found matching your query.</p>
            <button
              type="button"
              onClick={() => {
                setFilter('');
                setSelectedTag('All');
              }}
              className="mt-3 text-xs font-bold text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((dest) => (
              <div
                key={dest._id || dest.id}
                className="bg-white dark:bg-[#111622] rounded-3xl shadow-card hover:shadow-elevated border border-slate-100 dark:border-slate-800 overflow-hidden group transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-56 w-full overflow-hidden relative">
                    <TravelImage
                      query={`${dest.name}, ${dest.state || ''}`}
                      src={dest.image}
                      alt={`${dest.name}, ${dest.state} - ${dest.title}`}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded border border-amber-300/30">
                          {dest.state}
                        </span>
                        {dest.tag && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-900/60 backdrop-blur-sm px-2 py-0.5 rounded">
                            {dest.tag}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-white">{dest.name}</h3>
                      <p className="text-xs text-gray-200 line-clamp-1">{dest.title}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {dest.description}
                    </p>

                    {dest.highlights && dest.highlights.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {dest.highlights.slice(0, 3).map((h, i) => (
                          <span
                            key={i}
                            className="inline-block text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {dest.popularPickups && dest.popularPickups.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">Connected from {dest.popularPickups.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Starting Fare</span>
                      <span className="text-base font-black text-primary dark:text-purple-400 font-sans">
                        ₹{dest.startingFare || 450}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultOrigin = dest.popularPickups?.[0] || 'Kolkata';
                        navigate(
                          `/buses?from=${encodeURIComponent(defaultOrigin)}&to=${encodeURIComponent(
                            dest.name
                          )}&date=${today}`
                        );
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Buses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
