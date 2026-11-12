import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { POPULAR_CITIES } from '../../data/mockData';
import { ArrowLeftRight, Calendar, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const BusSearchForm = ({ compact = false, onSearchComplete }) => {
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useBooking();

  const [fromCity, setFromCity] = useState(searchParams.origin || 'Kolkata');
  const [toCity, setToCity] = useState(searchParams.destination || 'Siliguri');
  const [journeyDate, setJourneyDate] = useState(
    searchParams.journeyDate || new Date().toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(searchParams.returnDate || '');
  const [showReturn, setShowReturn] = useState(false);

  // Dropdown states
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const fromRef = useRef(null);
  const toRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Close dropdowns on outside click
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
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!fromCity) {
      toast.error('Please specify an origin city.');
      return;
    }
    if (!toCity) {
      toast.error('Please specify a destination city.');
      return;
    }
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      toast.error('Origin and destination cannot be the same city.');
      return;
    }
    if (!journeyDate) {
      toast.error('Please select a journey date.');
      return;
    }

    const newParams = {
      origin: fromCity,
      destination: toCity,
      journeyDate,
      returnDate: showReturn ? returnDate : ''
    };

    setSearchParams(newParams);
    if (onSearchComplete) onSearchComplete(newParams);

    navigate(`/buses?origin=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(toCity)}&date=${journeyDate}`);
  };

  const filteredFromCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(fromFilter.toLowerCase()) ||
    c.state.toLowerCase().includes(fromFilter.toLowerCase())
  );

  const filteredToCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(toFilter.toLowerCase()) ||
    c.state.toLowerCase().includes(toFilter.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-purple-100 ${
        compact ? 'p-4' : 'p-4 sm:p-6'
      }`}
    >
      {/* Journey Type Selector */}
      <div className="flex items-center gap-6 mb-4 text-xs font-semibold text-slate-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            checked={!showReturn}
            onChange={() => setShowReturn(false)}
            className="w-4 h-4 text-[#3B0764] focus:ring-[#7E22CE] accent-[#3B0764]"
          />
          <span className={!showReturn ? 'text-[#3B0764] font-bold' : ''}>Onward Journey</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            checked={showReturn}
            onChange={() => {
              setShowReturn(true);
              if (!returnDate) setReturnDate(journeyDate);
            }}
            className="w-4 h-4 text-[#3B0764] focus:ring-[#7E22CE] accent-[#3B0764]"
          />
          <span className={showReturn ? 'text-[#3B0764] font-bold' : ''}>Return Journey</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-3 items-center">
        {/* Origin City */}
        <div className="md:col-span-3 relative" ref={fromRef}>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            From City
          </label>
          <div
            onClick={() => setFromOpen(true)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-[#7E22CE] cursor-pointer bg-slate-50/50 hover:bg-white transition"
          >
            <div className="truncate">
              <span className="font-bold text-slate-800 text-sm block truncate">{fromCity}</span>
              <span className="text-[11px] text-slate-400 block truncate">
                {POPULAR_CITIES.find((c) => c.name === fromCity)?.state || 'Station'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          {/* From Dropdown */}
          {fromOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-purple-100 p-2 z-50">
              <input
                type="text"
                placeholder="Search city..."
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                autoFocus
                className="w-full px-3 py-1.5 text-xs border border-purple-100 rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-[#7E22CE]"
              />
              <div className="max-h-52 overflow-y-auto space-y-1">
                {filteredFromCities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      setFromCity(city.name);
                      setFromOpen(false);
                      setFromFilter('');
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-purple-50 transition ${
                      fromCity === city.name ? 'bg-purple-50 font-bold text-[#7E22CE]' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{city.name}</span>
                      <span className="text-[10px] text-slate-400">{city.state}</span>
                    </div>
                    {fromCity === city.name && <Check className="w-3.5 h-3.5 text-[#7E22CE]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin and Destination"
            className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 text-[#7E22CE] hover:bg-[#3B0764] hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination City */}
        <div className="md:col-span-3 relative" ref={toRef}>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            To City
          </label>
          <div
            onClick={() => setToOpen(true)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-[#7E22CE] cursor-pointer bg-slate-50/50 hover:bg-white transition"
          >
            <div className="truncate">
              <span className="font-bold text-slate-800 text-sm block truncate">{toCity}</span>
              <span className="text-[11px] text-slate-400 block truncate">
                {POPULAR_CITIES.find((c) => c.name === toCity)?.state || 'Station'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          {/* To Dropdown */}
          {toOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-purple-100 p-2 z-50">
              <input
                type="text"
                placeholder="Search city..."
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                autoFocus
                className="w-full px-3 py-1.5 text-xs border border-purple-100 rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-[#7E22CE]"
              />
              <div className="max-h-52 overflow-y-auto space-y-1">
                {filteredToCities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      setToCity(city.name);
                      setToOpen(false);
                      setToFilter('');
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-purple-50 transition ${
                      toCity === city.name ? 'bg-purple-50 font-bold text-[#7E22CE]' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{city.name}</span>
                      <span className="text-[10px] text-slate-400">{city.state}</span>
                    </div>
                    {toCity === city.name && <Check className="w-3.5 h-3.5 text-[#7E22CE]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journey Date */}
        <div className={showReturn ? 'md:col-span-2' : 'md:col-span-3'}>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Journey Date
          </label>
          <input
            type="date"
            min={todayStr}
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7E22CE] bg-slate-50/50"
          />
        </div>

        {/* Return Date (if selected) */}
        {showReturn && (
          <div className="md:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 truncate">
              Return
            </label>
            <input
              type="date"
              min={journeyDate || todayStr}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-2 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7E22CE] bg-slate-50/50"
            />
          </div>
        )}

        {/* Search Buses Button */}
        <div className="md:col-span-2">
          <label className="hidden md:block text-[11px] font-semibold text-transparent mb-1">
            Search
          </label>
          <button
            type="submit"
            className="w-full bg-[#3B0764] hover:bg-[#4C1D95] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md shadow-purple-950/20 transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Buses</span>
          </button>
        </div>
      </div>

      {/* Popular Route Shortcuts */}
      <div className="mt-3 pt-3 border-t border-purple-50 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium text-[11px]">Popular Searches:</span>
        {[
          { from: 'Indore', to: 'Pune' },
          { from: 'Ayodhya', to: 'Nagpur' },
          { from: 'Mumbai', to: 'Pune' },
          { from: 'Kolkata', to: 'Siliguri' },
          { from: 'Delhi', to: 'Jaipur' }
        ].map((route, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setFromCity(route.from);
              setToCity(route.to);
            }}
            className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-[#4C1D95] font-medium transition text-[11px]"
          >
            {route.from} ➔ {route.to}
          </button>
        ))}
      </div>
    </form>
  );
};

export default BusSearchForm;
