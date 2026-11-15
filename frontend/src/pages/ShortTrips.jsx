import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { packageApi } from '../services/api';
import { INITIAL_PACKAGES } from '../data/packagesData';
import OptimizedImage from '../components/common/OptimizedImage';
import { PackageCardSkeleton } from '../components/common/Skeletons';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Info,
  Bus,
  Search,
  Filter
} from 'lucide-react';

const CATEGORIES = ['All', 'Pilgrim', 'Konkan', 'Leisure', 'Monsoon', 'Heritage'];

const ShortTrips = () => {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchCity, setSearchCity] = useState('');
  const [activePackage, setActivePackage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    packageApi.getPackages()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPackages(data);
        }
      })
      .catch((err) => {
        console.warn('Live API tour package fetch warning, using verified dataset:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    if (selectedCategory !== 'All' && pkg.category !== selectedCategory) return false;
    if (searchCity) {
      const q = searchCity.toLowerCase();
      const matchCity = pkg.departureCity?.toLowerCase().includes(q) ||
                        pkg.destinationCity?.toLowerCase().includes(q) ||
                        pkg.routeDescription?.toLowerCase().includes(q) ||
                        pkg.title?.toLowerCase().includes(q);
      if (!matchCity) return false;
    }
    return true;
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans pb-20">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Curated Weekend Escapes &amp; Circuit Tours
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Short Trips &amp; Weekend Circuits
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hassle-free pre-planned bus holidays, spiritual Jyotirlinga circuits, misty Western Ghats trails, and sunny coastal getaways.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search by city (e.g. Pune, Delhi, Mumbai, Ganpatipule)..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* CATEGORY FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-500/25 scale-[1.02] border border-transparent'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-300 active:scale-95'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {isLoading && packages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <PackageCardSkeleton key={n} />
            ))}
          </div>
        )}

        {/* PACKAGE GRID */}
        {filteredPackages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, idx) => (
              <motion.div
                key={pkg._id || pkg.slug || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group bg-white dark:bg-[#121829] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={pkg.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}
                      alt={pkg.title}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-primary/90 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        {pkg.category}
                      </span>
                      {pkg.featured && (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-mono font-bold bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                        ⏱️ {pkg.durationDays}D / {pkg.durationNights}N
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-bold text-primary dark:text-purple-400 uppercase tracking-wider block mb-1">
                      {pkg.packageType || 'Scenic Circuit'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {pkg.routeDescription}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Starting from</span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      ₹{pkg.pricePerPerson} <span className="text-[10px] font-normal text-slate-400">/ person</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePackage(pkg)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <span>View Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && filteredPackages.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">No tour circuits found</h3>
            <p className="text-xs text-slate-500">Try selecting a different category or clearing your city search filter.</p>
          </div>
        )}
      </div>

      {/* ITINERARY DETAIL DRAWER / MODAL */}
      <AnimatePresence>
        {activePackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121829] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col"
            >
              <div className="relative h-44 shrink-0">
                <img
                  src={activePackage.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}
                  alt={activePackage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <button
                  type="button"
                  onClick={() => setActivePackage(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                    {activePackage.category} • {activePackage.packageType}
                  </span>
                  <h2 className="text-xl font-extrabold leading-tight">{activePackage.title}</h2>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {activePackage.durationDays} Days / {activePackage.durationNights} Nights
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Route Covered</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {activePackage.routeDescription}
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Itinerary */}
                {activePackage.itinerary?.length > 0 && (
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                      Day-by-Day Plan
                    </h4>
                    <div className="space-y-3">
                      {activePackage.itinerary.map((day) => (
                        <div key={day.day} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-primary dark:text-purple-400">Day {day.day}: {day.title}</span>
                            {day.meals?.length > 0 && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                🍽️ {day.meals.join(', ')}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {day.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inclusions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Inclusions
                    </h5>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                      {(activePackage.inclusions?.length ? activePackage.inclusions : ['AC Bus Journey', 'Resort Stay', 'Breakfast', 'Sightseeing Transfers']).map((inc, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/40">
                    <h5 className="font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" /> Exclusions
                    </h5>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                      {(activePackage.exclusions?.length ? activePackage.exclusions : ['Personal Expenses', 'Monument Entry Fees', 'Lunch/Dinner']).map((exc, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-rose-400"></span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom booking action */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">All-Inclusive Starting At</span>
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    ₹{activePackage.pricePerPerson} <span className="text-xs font-normal text-slate-400">/ person</span>
                  </span>
                </div>

                <Link
                  to={`/buses?from=${encodeURIComponent(activePackage.departureCity || 'Pune')}&to=${encodeURIComponent(activePackage.destinationCity || 'Ganpatipule')}&date=${today}`}
                  onClick={() => setActivePackage(null)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 text-xs cursor-pointer"
                >
                  <Bus className="w-4 h-4" />
                  <span>Book Bus for This Circuit</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShortTrips;
