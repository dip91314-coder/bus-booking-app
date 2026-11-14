import React, { useState, useRef } from 'react';
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
  ExternalLink,
  Tag,
  Check,
  Compass
} from 'lucide-react';
import { POPULAR_TRIPS_DATA, TRAVEL_STATS, PROMO_DEALS } from '../data/popularTripsData';
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

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('yatra_favorite_trips');
      return saved ? JSON.parse(saved) : ['maldives', 'kolkata'];
    } catch {
      return ['maldives', 'kolkata'];
    }
  });

  // Modals state
  const [selectedModalTrip, setSelectedModalTrip] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [dealsModalOpen, setDealsModalOpen] = useState(false);
  const [viewAllGrid, setViewAllGrid] = useState(false);
  const [gridFilter, setGridFilter] = useState('All');
  const [copiedCode, setCopiedCode] = useState('');

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
    const dest = selectedDestination.trim() || 'Maldives';
    navigate(`/buses?destination=${encodeURIComponent(dest)}&date=${checkInDate}`);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Filtered trips for grid view
  const states = ['All', ...new Set(POPULAR_TRIPS_DATA.map((t) => t.state))];
  const filteredGridTrips =
    gridFilter === 'All'
      ? POPULAR_TRIPS_DATA
      : POPULAR_TRIPS_DATA.filter((t) => t.state === gridFilter);

  return (
    <div className="min-h-screen bg-white dark:bg-[#080D1A] text-[#0F172A] dark:text-slate-100 font-sans antialiased overflow-x-hidden transition-colors duration-200 relative">
      {/* Ambient Top Sky Wash matching Travorra mockup */}
      <div className="absolute top-0 right-0 w-full lg:w-[62%] h-[600px] lg:h-[680px] bg-gradient-to-bl from-[#DCEBFE] via-[#EAF3FE] to-transparent dark:from-blue-950/40 dark:via-[#0E1626]/60 dark:to-transparent pointer-events-none rounded-bl-[120px] lg:rounded-bl-[200px] z-0 transition-colors" />

      {/* 1. HERO SECTION WITH ORGANIC CURVED VISUAL */}
      <section className="relative z-10 pt-6 pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headline & Actions */}
          <div className="lg:col-span-5 space-y-6 pt-2 lg:pt-6 z-10">
            {/* Tag / Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase shadow-sm">
              <span>EXPLORE. DREAM. DISCOVER.</span>
              <span className="text-sm">✈</span>
            </div>

            {/* Main Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#0F172A] dark:text-white tracking-tight leading-[1.08] font-serif">
              The world <br />
              <span className="text-[#0F172A] dark:text-white italic font-serif">is yours.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
              Find the best places to go, things to do, and unforgettable experiences across trending getaways and top transit corridors.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const elem = document.getElementById('featured-section');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
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
            <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] rounded-[38px] sm:rounded-[48px] overflow-hidden shadow-2xl shadow-blue-900/10 dark:shadow-black/50 border-4 border-white/80 dark:border-slate-800/80 group">
              {/* Mediterranean Santorini Scenic Visual */}
              <img
                src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80"
                alt="Santorini Mediterranean Coast"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80';
                }}
              />

              {/* Gentle Atmospheric Vignette */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-black/10 pointer-events-none" />

              {/* Embedded Play Button with Frosted Ring on Left Edge */}
              <div className="absolute left-6 bottom-6 sm:bottom-12 z-20 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 dark:bg-[#111622]/95 backdrop-blur-md shadow-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-110 active:scale-95 transition-all duration-200 border border-white dark:border-slate-700 cursor-pointer"
                  title="Watch Travel Story"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                </button>
                <div className="hidden sm:block text-left text-white drop-shadow-md">
                  <p className="text-xs font-bold leading-tight">Watch travel story</p>
                  <p className="text-[10px] text-white/80">3 min preview</p>
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
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">joined this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FLOATING MODERN PILL SEARCH BAR */}
        <div className="relative -mt-8 sm:-mt-10 lg:-mt-12 z-30 max-w-[1100px] mx-auto px-2">
          <div className="bg-white dark:bg-[#111622] rounded-[28px] sm:rounded-full shadow-[0_20px_50px_-10px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-200/90 dark:border-slate-800 p-3 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
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
                    className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer truncate pr-2 appearance-none"
                  >
                    <option value="" className="dark:bg-[#111622] dark:text-white">Search destinations</option>
                    {POPULAR_TRIPS_DATA.map((t) => (
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

            {/* Segment 2: Check in */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Check in
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-9 bg-slate-200 dark:bg-slate-800" />

            {/* Segment 3: Check out */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Check out
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    placeholder="Add dates"
                    className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-9 bg-slate-200 dark:bg-slate-800" />

            {/* Segment 4: Travelers */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1 relative">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div
                className="flex-1 text-left cursor-pointer"
                onClick={() => setTravelersOpen(!travelersOpen)}
              >
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Travelers
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {travelers} {parseInt(travelers) === 1 ? 'Traveler' : 'Travelers'}
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
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOWER SECTION: SPLIT GRID WITH PROMO CARD & POPULAR DESTINATIONS CAROUSEL */}
      <section id="featured-section" className="py-10 lg:py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols): Limited Time Offer Card + Stats Bar */}
          <div className="lg:col-span-5 space-y-4">
            {/* Offer Card */}
            <div className="relative rounded-[32px] overflow-hidden shadow-xl p-6 sm:p-7 min-h-[230px] sm:min-h-[250px] flex flex-col justify-between text-white group">
              {/* Background Landscape with Hiker Overlook */}
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
                alt="Limited Time Offer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Deep Blue Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-transparent" />

              {/* Card Top: Frosted Badge */}
              <div className="relative z-10">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
                  LIMITED TIME OFFER
                </span>
                <h3 className="text-2xl sm:text-[26px] font-bold text-white mt-3 leading-snug tracking-tight">
                  Get up to 30% off <br />
                  <span className="text-blue-200 font-normal">on select destinations</span>
                </h3>
              </div>

              {/* Card Bottom CTA */}
              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  onClick={() => setDealsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>View Deals</span>
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
                  <h4 className="text-base font-bold text-[#0F172A] dark:text-white leading-tight">120+</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Destinations</p>
                </div>
              </div>

              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] dark:text-white leading-tight">2000+</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Experiences</p>
                </div>
              </div>

              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] dark:text-white leading-tight">18K+</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Happy Travelers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Featured Destinations Carousel */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header: Title + View all + Navigation Arrows */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                  Featured destinations
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Popular intercity transit points and world-class tourist getaways
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewAllGrid(!viewAllGrid)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors hidden sm:inline-block cursor-pointer"
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
              {POPULAR_TRIPS_DATA.map((dest) => {
                const isFav = favorites.includes(dest.id);
                return (
                  <div
                    key={dest.id}
                    onClick={() => setSelectedModalTrip(dest)}
                    className="w-[210px] sm:w-[230px] h-[330px] rounded-[28px] shrink-0 overflow-hidden relative shadow-md group cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Destination Cover Image */}
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = dest.fallbackImage;
                      }}
                    />

                    {/* Top Right: Frosted Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, dest.id)}
                      className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition-all duration-200 z-10 cursor-pointer ${
                        isFav
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/80 dark:bg-black/50 hover:bg-white text-slate-700 dark:text-slate-200'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    {/* Top Left: State / Region Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                        {dest.state}
                      </span>
                    </div>

                    {/* Bottom Dark Gradient & Info */}
                    <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between text-white">
                      <div>
                        <h4 className="text-lg font-bold leading-tight drop-shadow-sm">{dest.name}</h4>
                        <p className="text-xs text-slate-300 mt-0.5">From {dest.fare}</p>
                      </div>

                      {/* Star Rating Badge */}
                      <div className="bg-white/95 dark:bg-[#111622]/95 backdrop-blur-md text-[#0F172A] dark:text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold">{dest.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. EXPANDABLE ALL POPULAR DESTINATIONS GRID */}
        {viewAllGrid && (
          <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 animate__animated animate__fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white">All Popular Corridors</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Browse complete destination guide, transit connectivity, and starting fares
                </p>
              </div>

              {/* State Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
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
                  className="bg-white dark:bg-[#111622] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 group cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = dest.fallbackImage;
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full">
                        {dest.state}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#111622]/90 backdrop-blur-md text-[#0F172A] dark:text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold">{dest.rating}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-[#0F172A] dark:text-white">{dest.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">From {dest.fare}</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. INTERACTIVE MODAL: DESTINATION DETAILS DRAWER */}
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
                <img
                  src={selectedModalTrip.image}
                  alt={selectedModalTrip.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = selectedModalTrip.fallbackImage;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSelectedModalTrip(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-bold bg-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedModalTrip.state}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-2 drop-shadow-md">
                    {selectedModalTrip.name}
                  </h3>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    About this destination
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                    {selectedModalTrip.description}
                  </p>
                </div>

                {/* Key Highlights */}
                {selectedModalTrip.highlights && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Key Attractions & Landmarks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModalTrip.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coordinates & Source */}
                <div className="p-3 bg-slate-50 dark:bg-[#161D2E] rounded-2xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {selectedModalTrip.latitude}° N, {selectedModalTrip.longitude}° E
                    </span>
                  </div>
                  {selectedModalTrip.imageSource && (
                    <a
                      href={selectedModalTrip.imageSource}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Image Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                      Starting Fare
                    </span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {selectedModalTrip.fare}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/buses?destination=${encodeURIComponent(selectedModalTrip.name)}`);
                    }}
                    className="flex-1 py-3 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Find Buses to {selectedModalTrip.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. TRAVEL STORY VIDEO MODAL */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#111622] rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
                  alt="Travel Story Reel"
                  className="w-full h-full object-cover opacity-80"
                />
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors z-10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white bg-black/40">
                  <div className="w-16 h-16 rounded-full bg-blue-600/90 flex items-center justify-center shadow-xl animate-pulse mb-3">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                  <h3 className="text-xl font-bold">The World is Yours: Travel Story</h3>
                  <p className="text-xs text-slate-200 mt-1 max-w-sm">
                    Watch our traveler community explore coastal horizons, mountain hideaways, and vibrant cultural landmarks.
                  </p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between bg-slate-50 dark:bg-[#161D2E]">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Shared by over 25,000 verified passengers
                </span>
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Close Reel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. LIMITED TIME DEALS MODAL */}
      <AnimatePresence>
        {dealsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Limited Time Promo Deals</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Apply coupon at checkout for instant discounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDealsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {PROMO_DEALS.map((deal) => (
                  <div
                    key={deal.code}
                    className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-white dark:bg-[#111622] px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {deal.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{deal.discount}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#0F172A] dark:text-white mt-1">{deal.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{deal.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(deal.code)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedCode === deal.code ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PopularTrips;