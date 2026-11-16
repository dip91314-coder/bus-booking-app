import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  X,
  ArrowRight,
  Globe,
  Briefcase,
  Sparkles,
  Tag,
  Check,
  Compass,
  Bus,
  Clock,
  Milestone,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { POPULAR_TRIPS_DATA, TRAVEL_STATS, PROMO_DEALS } from '../data/popularTripsData';
import { destinationApi, routeApi, offerApi } from '../services/api';
import TravelImage from '../components/common/TravelImage';
import toast from 'react-hot-toast';

const PopularTrips = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // Search Bar State
  const [selectedDestination, setSelectedDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [travelersOpen, setTravelersOpen] = useState(false);

  // Live data integrations from backend API
  const [liveDestinations, setLiveDestinations] = useState([]);
  const [liveOffers, setLiveOffers] = useState([]);
  const [liveRoutes, setLiveRoutes] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('yatra_favorite_trips');
      return saved ? JSON.parse(saved) : ['digha', 'siliguri', 'manali'];
    } catch {
      return ['digha', 'siliguri', 'manali'];
    }
  });

  // Modal preview states
  const [selectedModalTrip, setSelectedModalTrip] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [dealsModalOpen, setDealsModalOpen] = useState(false);
  const [viewAllGrid, setViewAllGrid] = useState(false);
  const [gridFilter, setGridFilter] = useState('All');
  const [copiedCode, setCopiedCode] = useState('');

  // Fetch real destinations and offers from API
  useEffect(() => {
    let isMounted = true;
    setLoadingLive(true);
    Promise.allSettled([
      destinationApi.getDestinations(),
      offerApi.getOffers(),
      routeApi.getRoutes()
    ]).then(([destRes, offerRes, routeRes]) => {
      if (!isMounted) return;
      if (destRes.status === 'fulfilled' && Array.isArray(destRes.value) && destRes.value.length > 0) {
        setLiveDestinations(destRes.value);
      }
      if (offerRes.status === 'fulfilled' && Array.isArray(offerRes.value) && offerRes.value.length > 0) {
        setLiveOffers(offerRes.value);
      }
      if (routeRes.status === 'fulfilled' && Array.isArray(routeRes.value) && routeRes.value.length > 0) {
        setLiveRoutes(routeRes.value);
      }
      setLoadingLive(false);
    }).catch(() => {
      if (isMounted) setLoadingLive(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Merge POPULAR_TRIPS_DATA with live destinations from database
  const combinedDestinations = React.useMemo(() => {
    if (!liveDestinations || liveDestinations.length === 0) {
      return POPULAR_TRIPS_DATA;
    }
    // Transform backend destinations to match schema
    const apiFormatted = liveDestinations.map(d => ({
      id: d._id || d.slug || d.name.toLowerCase().replace(/\s+/g, '-'),
      name: d.name,
      state: d.state || 'India',
      description: d.description || d.title,
      latitude: d.latitude || 22.5,
      longitude: d.longitude || 88.3,
      image: d.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      fare: `₹${d.startingFare || 450}`,
      rating: 4.8,
      category: d.tag || 'Popular Destination',
      highlights: d.highlights && d.highlights.length > 0 ? d.highlights : ['Scenic Views', 'Heritage Sights', 'Local Cuisine'],
      connectedFrom: d.popularPickups && d.popularPickups.length > 0 ? d.popularPickups : ['Kolkata', 'Delhi', 'Mumbai', 'Bengaluru']
    }));

    // Avoid duplicates by name
    const existingNames = new Set(apiFormatted.map(d => d.name.toLowerCase()));
    const additional = POPULAR_TRIPS_DATA.filter(d => !existingNames.has(d.name.toLowerCase()));
    return [...apiFormatted, ...additional];
  }, [liveDestinations]);

  // Toggle favorite
  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('yatra_favorite_trips', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Carousel scroll controls
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Perform search navigation
  const handleSearch = () => {
    const dest = selectedDestination.trim() || 'Digha';
    navigate(`/buses?destination=${encodeURIComponent(dest)}&date=${checkInDate}`);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Filtered trips for grid view
  const states = ['All', ...new Set(combinedDestinations.map((t) => t.state))];
  const filteredGridTrips =
    gridFilter === 'All'
      ? combinedDestinations
      : combinedDestinations.filter((t) => t.state === gridFilter);

  // Quick book to destination from preview modal
  const handleBookFromModal = (trip) => {
    const origin = (trip.connectedFrom && trip.connectedFrom.length > 0) ? trip.connectedFrom[0] : 'Kolkata';
    const date = checkInDate || new Date().toISOString().split('T')[0];
    navigate(`/buses?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(trip.name)}&date=${date}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] text-[#0F172A] dark:text-slate-100 font-sans antialiased overflow-x-hidden transition-colors duration-200 relative">
      {/* Ambient Top Sky Wash */}
      <div className="absolute top-0 right-0 w-full lg:w-[62%] h-[600px] lg:h-[680px] bg-gradient-to-bl from-blue-100/60 via-indigo-50/50 to-transparent dark:from-blue-950/40 dark:via-[#0E1626]/60 dark:to-transparent pointer-events-none rounded-bl-[120px] lg:rounded-bl-[200px] z-0 transition-colors" />

      {/* 1. HERO SECTION WITH ORGANIC CURVED VISUAL */}
      <section className="relative z-10 pt-8 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Actions */}
          <div className="lg:col-span-5 space-y-6 pt-2 lg:pt-6 z-10">
            {/* Tag / Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase shadow-sm">
              <Compass className="w-3.5 h-3.5" />
              <span>EXPLORE. DREAM. DISCOVER.</span>
            </div>

            {/* Main Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
              The world <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                is yours to travel.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
              Find the best places to go, scenic weekend circuits, and verified intercity bus corridors with direct seat reservations.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  const elem = document.getElementById('featured-section');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
              >
                <span className="w-11 h-11 rounded-full bg-white dark:bg-[#111622] shadow-md border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </span>
                <span>Watch travel story</span>
              </button>
            </div>
          </div>

          {/* Right Column: Organic Curved Scenic Image */}
          <div className="lg:col-span-7 relative">
            <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] rounded-[36px] sm:rounded-[48px] overflow-hidden shadow-2xl shadow-blue-900/10 dark:shadow-black/50 border-4 border-white/80 dark:border-slate-800/80 group">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1400&q=80"
                alt="YatraBus scenic luxury transit"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gentle Atmospheric Vignette */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/10 pointer-events-none" />

              {/* Embedded Play Button with Frosted Ring on Left Edge */}
              <div className="absolute left-6 bottom-6 sm:bottom-10 z-20 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 dark:bg-[#111622]/95 backdrop-blur-md shadow-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-110 active:scale-95 transition-all duration-200 border border-white dark:border-slate-700 cursor-pointer"
                  title="Watch Travel Story"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                </button>
                <div className="hidden sm:block text-left text-white drop-shadow-md">
                  <p className="text-xs font-bold leading-tight">YatraBus Experience</p>
                  <p className="text-[10px] text-white/80">3 min visual preview</p>
                </div>
              </div>

              {/* Floating "Happy Travelers" Card - Top Right */}
              <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 bg-white/95 dark:bg-[#111622]/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-white/60 dark:border-slate-700/60 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Traveler 1"
                  />
                  <img
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Traveler 2"
                  />
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-800">
                    25K+
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight">Happy Travelers</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">booked this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FLOATING MODERN PILL SEARCH BAR */}
        <div className="relative -mt-8 sm:-mt-10 lg:-mt-12 z-30 max-w-[1100px] mx-auto px-2">
          <div className="bg-white dark:bg-[#111622] rounded-[24px] sm:rounded-full shadow-[0_20px_50px_-10px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-200/90 dark:border-slate-800 p-3 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
            {/* Segment 1: Where to? */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1 relative">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left min-w-[140px]">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Where to?
                </label>
                <div className="flex items-center justify-between">
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full text-sm font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer truncate pr-2 appearance-none"
                  >
                    <option value="" className="dark:bg-[#111622] dark:text-white">Choose a destination...</option>
                    {combinedDestinations.map((t) => (
                      <option key={t.id} value={t.name} className="dark:bg-[#111622] dark:text-white">
                        {t.name}, {t.state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-9 bg-slate-200 dark:bg-slate-800" />

            {/* Segment 2: Travel Date */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Journey Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-9 bg-slate-200 dark:bg-slate-800" />

            {/* Segment 3: Passengers */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1 relative">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left cursor-pointer" onClick={() => setTravelersOpen(!travelersOpen)}>
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Passengers
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {travelers} {parseInt(travelers) === 1 ? 'Passenger' : 'Passengers'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>

              {/* Travelers Dropdown Menu */}
              {travelersOpen && (
                <div className="absolute top-14 left-0 bg-white dark:bg-[#111622] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-3 z-40 w-44 space-y-1">
                  {['1', '2', '3', '4', '5+'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setTravelers(num);
                        setTravelersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                        travelers === num
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{num} {num === '1' ? 'Person' : 'People'}</span>
                      {travelers === num && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Action Button */}
            <div className="shrink-0 flex items-center justify-end px-1">
              <button
                type="button"
                onClick={handleSearch}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Search Bus Routes"
              >
                <Search className="w-5 h-5 stroke-[2.4]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOWER SECTION: SPLIT GRID WITH PROMO CARD & POPULAR DESTINATIONS CAROUSEL */}
      <section id="featured-section" className="py-8 lg:py-12 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols): Limited Time Offer Card + Stats Bar */}
          <div className="lg:col-span-5 space-y-4">
            {/* Offer Card */}
            <div className="relative rounded-[32px] overflow-hidden shadow-xl p-6 sm:p-7 min-h-[240px] sm:min-h-[260px] flex flex-col justify-between text-white group">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
                alt="Limited Time Offer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/85 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
                  LIMITED TIME OFFER
                </span>
                <h3 className="text-2xl sm:text-[28px] font-black text-white mt-3 leading-snug tracking-tight">
                  Get up to 30% off <br />
                  <span className="text-blue-200 font-normal">on select getaways</span>
                </h3>
              </div>

              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  onClick={() => setDealsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>View Deals & Coupons</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Travel Stats Bar directly beneath the offer card */}
            <div className="bg-white dark:bg-[#111622] rounded-[24px] p-5 shadow-sm border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">120+</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Destinations</p>
                </div>
              </div>

              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">2000+</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Daily Trips</p>
                </div>
              </div>

              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">18K+</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Happy Riders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Featured Destinations Carousel */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header: Title + View all + Navigation Arrows */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Featured destinations
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any card to preview highlights, starting fares, and connected transit hubs
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewAllGrid(!viewAllGrid)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors hidden sm:inline-block cursor-pointer"
                >
                  {viewAllGrid ? 'Hide all' : 'View all >'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollCarousel('left')}
                    className="w-9 h-9 rounded-full bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel('right')}
                    className="w-9 h-9 rounded-full bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {combinedDestinations.map((dest) => {
                const isFav = favorites.includes(dest.id);
                return (
                  <div
                    key={dest.id}
                    onClick={() => setSelectedModalTrip(dest)}
                    className="shrink-0 w-[260px] sm:w-[280px] bg-white dark:bg-[#111622] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 dark:border-slate-800 group cursor-pointer transition-all duration-300 snap-start flex flex-col justify-between"
                  >
                    {/* Top Image Box */}
                    <div className="relative h-44 overflow-hidden">
                      <TravelImage
                        query={`${dest.name}, ${dest.state || ''}`}
                        src={dest.image}
                        alt={dest.name}
                        fallbackSrc={dest.fallbackImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* State Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold text-white bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                          {dest.state}
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, dest.id)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                          isFav
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/90 dark:bg-[#111622]/90 text-slate-600 dark:text-slate-300 hover:scale-110'
                        }`}
                        title="Add to Favorites"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {/* Rating Pill */}
                      <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#111622]/95 backdrop-blur-md text-slate-900 dark:text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold">{dest.rating}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {dest.name}
                          </h3>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                            From {dest.fare}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {dest.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                          Preview Details <ArrowRight className="w-3 h-3" />
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dest.connectedFrom?.length || 3} routes
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. EXPANDABLE ALL DESTINATIONS GRID */}
        {viewAllGrid && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  All Travel Destinations & Corridors
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Browse complete catalogue filtered by regional transit hub
                </p>
              </div>

              {/* State Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {states.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setGridFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      gridFilter === st
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-[#111622] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredGridTrips.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => setSelectedModalTrip(dest)}
                  className="bg-white dark:bg-[#111622] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 dark:border-slate-800 group cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden">
                    <TravelImage
                      query={`${dest.name}, ${dest.state || ''}`}
                      src={dest.image}
                      alt={dest.name}
                      fallbackSrc={dest.fallbackImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold text-white bg-black/55 backdrop-blur-md px-2 py-0.5 rounded-full">
                        {dest.state}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#111622]/90 backdrop-blur-md text-slate-900 dark:text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold">{dest.rating}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{dest.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">From {dest.fare}</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Preview <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. TOP INTERCITY BUS CORRIDORS (REAL TRANSIT NETWORK) */}
      <section className="py-12 bg-white dark:bg-[#0E1526] border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Bus className="w-3.5 h-3.5" /> High-Demand Express Corridors
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Popular Bus Routes Across India
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Direct daily luxury coaches, express transit, and guaranteed departures
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/buses')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
            >
              <span>Explore All Bus Routes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                origin: 'Kolkata',
                destination: 'Siliguri',
                distanceKm: 580,
                duration: '10h 30m',
                fare: 890,
                type: 'Multi-Axle AC Sleeper (2+1)',
                operator: 'YatraBus Volvo Express',
                services: '12 daily departures',
                img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
              },
              {
                origin: 'Mumbai',
                destination: 'Pune',
                distanceKm: 150,
                duration: '3h 30m',
                fare: 400,
                type: 'AC Seater (2+2)',
                operator: 'YatraBus Shivneri',
                services: '24 daily departures',
                img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80'
              },
              {
                origin: 'Delhi',
                destination: 'Jaipur',
                distanceKm: 280,
                duration: '5h 15m',
                fare: 550,
                type: 'Premium AC Sleeper (2+1)',
                operator: 'YatraBus Royal Gold',
                services: '18 daily departures',
                img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80'
              },
              {
                origin: 'Bengaluru',
                destination: 'Chennai',
                distanceKm: 345,
                duration: '6h 30m',
                fare: 750,
                type: 'Diamond AC Sleeper (2+1)',
                operator: 'YatraBus Southern Star',
                services: '14 daily departures',
                img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80'
              },
              {
                origin: 'Delhi',
                destination: 'Manali',
                distanceKm: 535,
                duration: '14h 00m',
                fare: 1350,
                type: 'Volvo 9600 Multi-Axle',
                operator: 'YatraBus Mountain Fleet',
                services: '8 daily departures',
                img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80'
              },
              {
                origin: 'Kolkata',
                destination: 'Digha',
                distanceKm: 185,
                duration: '4h 15m',
                fare: 350,
                type: 'Express AC Seater (2+2)',
                operator: 'YatraBus Coastal Rider',
                services: '16 daily departures',
                img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
              }
            ].map((route, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                      {route.operator}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {route.services}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {route.origin}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {route.destination}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {route.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Milestone className="w-3.5 h-3.5 text-slate-400" /> {route.distanceKm} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-slate-400" /> {route.type}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fares From</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{route.fare}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const date = checkInDate || new Date().toISOString().split('T')[0];
                      navigate(`/buses?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}&date=${date}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>Book Seats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE MODAL: DESTINATION DETAILS PREVIEW DRAWER */}
      <AnimatePresence>
        {selectedModalTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#111622] rounded-[32px] overflow-hidden max-w-xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              {/* Modal Image Header */}
              <div className="relative h-64 w-full overflow-hidden">
                <TravelImage
                  query={`${selectedModalTrip.name}, ${selectedModalTrip.state || ''}`}
                  src={selectedModalTrip.image}
                  alt={selectedModalTrip.name}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  fallbackSrc={selectedModalTrip.fallbackImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                />
                <button
                  type="button"
                  onClick={() => setSelectedModalTrip(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-600 px-2.5 py-1 rounded-full shadow-sm">
                      {selectedModalTrip.category || selectedModalTrip.state}
                    </span>
                    <h3 className="text-2xl font-black mt-2 drop-shadow-md">{selectedModalTrip.name}</h3>
                  </div>
                  <div className="bg-white/90 dark:bg-[#111622]/90 backdrop-blur-md text-slate-900 dark:text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold">{selectedModalTrip.rating || 4.8}</span>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About Locale</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedModalTrip.description}
                  </p>
                </div>

                {/* Highlights */}
                {selectedModalTrip.highlights && selectedModalTrip.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModalTrip.highlights.map((hl, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <Check className="w-3 h-3 text-emerald-500" /> {hl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Routes */}
                {selectedModalTrip.connectedFrom && selectedModalTrip.connectedFrom.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Direct Connected Corridors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModalTrip.connectedFrom.map((city, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const date = checkInDate || new Date().toISOString().split('T')[0];
                            navigate(`/buses?origin=${encodeURIComponent(city)}&destination=${encodeURIComponent(selectedModalTrip.name)}&date=${date}`);
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{city} ➔ {selectedModalTrip.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Starting Fare</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">{selectedModalTrip.fare}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedModalTrip(null)}
                      className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookFromModal(selectedModalTrip)}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Find Buses to {selectedModalTrip.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. VIDEO STORY MODAL */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative border border-slate-800 aspect-video flex items-center justify-center"
            >
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <video
                src="/hero-video.mp4"
                poster="/hero-bus.jpg"
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. LIMITED TIME DEALS MODAL */}
      <AnimatePresence>
        {dealsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#111622] rounded-[32px] overflow-hidden max-w-lg w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                    Active Promo Coupons
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Exclusive Travel Savings</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDealsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {(liveOffers.length > 0 ? liveOffers : PROMO_DEALS).map((deal, idx) => {
                  const code = deal.code;
                  const discount = deal.discountType === 'percent' ? `${deal.value}% OFF` : (deal.discount || `₹${deal.value} OFF`);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                            {discount}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{code}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{deal.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{deal.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(code)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          copiedCode === code
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {copiedCode === code ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Tag className="w-3.5 h-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setDealsModalOpen(false);
                    navigate('/buses');
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition"
                >
                  Apply Deals & Search Buses
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PopularTrips;
