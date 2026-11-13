import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { POPULAR_CITIES } from '../../data/mockData';
import { ArrowLeftRight, Calendar, Search, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const BusSearchForm = ({ compact = false, onSearchComplete }) => {
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useBooking();

  const [fromCity, setFromCity] = useState(searchParams.origin || 'Kolkata');
  const [toCity, setToCity] = useState(searchParams.destination || 'Siliguri');
  const todayISO = new Date().toISOString().split('T')[0];
  const [journeyDate, setJourneyDate] = useState(searchParams.journeyDate || todayISO);
  const [returnDate, setReturnDate] = useState(searchParams.returnDate || '');
  const [tripType, setTripType] = useState('onward'); // 'onward' | 'return'
  const [inlineError, setInlineError] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [pulseRoute, setPulseRoute] = useState(false);

  // Dropdown states
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(e.target)) {
        setToOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    setInlineError('');
    setIsSwapping(true);
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setInlineError('');

    if (!fromCity) {
      setInlineError('Please select an origin city.');
      return;
    }
    if (!toCity) {
      setInlineError('Please select a destination city.');
      return;
    }
    if (fromCity.toLowerCase().trim() === toCity.toLowerCase().trim()) {
      setInlineError('Origin and destination cities cannot be the same.');
      return;
    }
    if (!journeyDate) {
      setInlineError('Please choose a valid journey date.');
      return;
    }

    setIsSearching(true);

    const newParams = {
      origin: fromCity,
      destination: toCity,
      journeyDate,
      returnDate: tripType === 'return' ? returnDate : ''
    };

    setSearchParams(newParams);
    if (onSearchComplete) onSearchComplete(newParams);

    setTimeout(() => {
      setIsSearching(false);
      navigate(`/buses?origin=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(toCity)}&date=${journeyDate}`);
    }, 350);
  };

  const setPopularRoute = (origin, destination) => {
    setInlineError('');
    setFromCity(origin);
    setToCity(destination);
    setPulseRoute(true);
    setTimeout(() => setPulseRoute(false), 300);
  };

  const filteredFromCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(fromFilter.toLowerCase()) ||
      c.state.toLowerCase().includes(fromFilter.toLowerCase())
  );

  const filteredToCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(toFilter.toLowerCase()) ||
      c.state.toLowerCase().includes(toFilter.toLowerCase())
  );

  const formatDisplayDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      return format(parseISO(isoStr), 'dd MMM yyyy');
    } catch {
      return isoStr;
    }
  };

  const popularChips = [
    { from: 'Kolkata', to: 'Siliguri' },
    { from: 'Delhi', to: 'Jaipur' },
    { from: 'Mumbai', to: 'Pune' },
    { from: 'Bengaluru', to: 'Chennai' },
    { from: 'Delhi', to: 'Manali' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-floating-search border border-[#E5E7EB] p-6 text-[#0F172A] relative">
      {/* Segmented Journey Toggle with sliding indicator */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative inline-flex p-1 bg-[#F1F5F9] rounded-full border border-[#E5E7EB]" role="tablist">
          {/* Animated sliding purple indicator pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#5B21B6] rounded-full shadow-sm transition-all duration-300 ease-out ${
              tripType === 'onward' ? 'left-1' : 'left-[calc(50%+2px)]'
            }`}
          />

          <button
            type="button"
            role="tab"
            aria-selected={tripType === 'onward'}
            onClick={() => setTripType('onward')}
            className={`relative z-10 px-5 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 select-none ${
              tripType === 'onward' ? 'text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            One Way
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tripType === 'return'}
            onClick={() => {
              setTripType('return');
              if (!returnDate) setReturnDate(journeyDate);
            }}
            className={`relative z-10 px-5 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 select-none ${
              tripType === 'return' ? 'text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Round Trip
          </button>
        </div>

        <span className="text-xs text-[#64748B] hidden sm:inline font-medium">
          Verified operators & live seat booking
        </span>
      </div>

      {/* Main Search Row Form */}
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* From City */}
          <div className="md:col-span-3 relative" ref={fromRef}>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">
              From
            </label>
            <button
              type="button"
              onClick={() => {
                setFromOpen(!fromOpen);
                setToOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F8F7FC] hover:bg-white focus:outline-none focus:border-[#5B21B6] focus:ring-[3px] focus:ring-[#5B21B6]/20 transition-all duration-200 ${
                pulseRoute ? 'ring-2 ring-[#5B21B6] bg-purple-50/50' : ''
              }`}
            >
              <div
                className={`transition-transform duration-300 ease-out ${
                  isSwapping ? 'translate-x-3 opacity-50' : 'translate-x-0 opacity-100'
                }`}
              >
                <span className="block text-base font-semibold text-[#0F172A] truncate leading-tight">
                  {fromCity || 'Select Origin'}
                </span>
                <span className="block text-xs text-[#64748B] truncate mt-0.5">
                  {POPULAR_CITIES.find((c) => c.name === fromCity)?.state || 'India'}
                </span>
              </div>
            </button>

            {/* From Dropdown */}
            {fromOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-md shadow-soft border border-[#E5E7EB] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <input
                  type="text"
                  placeholder="Type city name..."
                  value={fromFilter}
                  onChange={(e) => setFromFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-sm focus:outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 mb-2"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filteredFromCities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => {
                        setFromCity(city.name);
                        setFromOpen(false);
                        setInlineError('');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-sm text-xs text-[#0F172A] hover:bg-[#F5F3FF] hover:text-[#5B21B6] flex items-center justify-between transition-colors"
                    >
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-[11px] text-[#64748B]">{city.state}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button (Perfect Circle, rotates 180deg) */}
          <div className="md:col-span-1 flex justify-center pt-5 md:pt-0">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap origin and destination"
              className="w-10 h-10 rounded-full border border-[#E5E7EB] hover:border-[#5B21B6] bg-white flex items-center justify-center text-[#475569] hover:text-[#5B21B6] transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6] active:scale-90"
            >
              <ArrowLeftRight
                className={`w-4 h-4 transition-transform duration-300 ease-out ${
                  isSwapping ? 'rotate-180 scale-110 text-[#5B21B6]' : 'rotate-0'
                }`}
              />
            </button>
          </div>

          {/* To City */}
          <div className="md:col-span-3 relative" ref={toRef}>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">
              To
            </label>
            <button
              type="button"
              onClick={() => {
                setToOpen(!toOpen);
                setFromOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#F8F7FC] hover:bg-white focus:outline-none focus:border-[#5B21B6] focus:ring-[3px] focus:ring-[#5B21B6]/20 transition-all duration-200 ${
                pulseRoute ? 'ring-2 ring-[#5B21B6] bg-purple-50/50' : ''
              }`}
            >
              <div
                className={`transition-transform duration-300 ease-out ${
                  isSwapping ? '-translate-x-3 opacity-50' : 'translate-x-0 opacity-100'
                }`}
              >
                <span className="block text-base font-semibold text-[#0F172A] truncate leading-tight">
                  {toCity || 'Select Destination'}
                </span>
                <span className="block text-xs text-[#64748B] truncate mt-0.5">
                  {POPULAR_CITIES.find((c) => c.name === toCity)?.state || 'India'}
                </span>
              </div>
            </button>

            {/* To Dropdown */}
            {toOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-md shadow-soft border border-[#E5E7EB] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <input
                  type="text"
                  placeholder="Type city name..."
                  value={toFilter}
                  onChange={(e) => setToFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-sm focus:outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 mb-2"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filteredToCities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => {
                        setToCity(city.name);
                        setToOpen(false);
                        setInlineError('');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-sm text-xs text-[#0F172A] hover:bg-[#F5F3FF] hover:text-[#5B21B6] flex items-center justify-between transition-colors"
                    >
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-[11px] text-[#64748B]">{city.state}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Field(s) */}
          <div className={tripType === 'return' ? 'md:col-span-3 grid grid-cols-2 gap-2' : 'md:col-span-3'}>
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayISO}
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[#E5E7EB] text-sm font-semibold text-[#0F172A] bg-[#F8F7FC] hover:bg-white focus:outline-none focus:border-[#5B21B6] focus:ring-[3px] focus:ring-[#5B21B6]/20 transition-all duration-200"
                />
                <span className="text-[11px] text-[#64748B] block mt-0.5 font-medium">
                  {formatDisplayDate(journeyDate)}
                </span>
              </div>
            </div>

            {tripType === 'return' && (
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">
                  Return
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={journeyDate || todayISO}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[12px] border border-[#E5E7EB] text-sm font-semibold text-[#0F172A] bg-[#F8F7FC] hover:bg-white focus:outline-none focus:border-[#5B21B6] focus:ring-[3px] focus:ring-[#5B21B6]/20 transition-all duration-200"
                  />
                  <span className="text-[11px] text-[#64748B] block mt-0.5 font-medium">
                    {formatDisplayDate(returnDate)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search CTA Button (12px radius, purple gradient, lifts 2px with glow on hover, active scale 0.98, loading spinner) */}
          <div className="md:col-span-2 pt-5 md:pt-0">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full min-h-[48px] px-5 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] rounded-[12px] shadow-soft hover:-translate-y-0.5 hover:shadow-glow-purple active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 select-none disabled:opacity-75 disabled:cursor-wait"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Buses</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Inline Validation Alert */}
      {inlineError && (
        <div className="mt-3 p-2.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <span>⚠️</span>
          <span>{inlineError}</span>
        </div>
      )}

      {/* Popular Route Chips (Fully rounded pills, hover lifts 2px and fills purple) */}
      <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#64748B] font-medium mr-1">Popular:</span>
        {popularChips.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPopularRoute(r.from, r.to)}
            className="px-3.5 py-1.5 rounded-full bg-[#F8F7FC] hover:bg-[#5B21B6] hover:text-white border border-[#E5E7EB] hover:border-[#5B21B6] text-[#475569] text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
          >
            {r.from} → {r.to}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BusSearchForm;
