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
      className={`bg-white rounded-2xl shadow-elevated border border-blue-100 ${
        compact ? 'p-4' : 'p-4 sm:p-6 lg:p-8'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-4 items-center">
        {/* Origin City */}
        <div className="md:col-span-5 relative" ref={fromRef}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            From (Origin)
          </label>
          <div
            onClick={() => setFromOpen(true)}
            className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-gray-200 hover:border-primary/60 cursor-pointer bg-gray-50/50 hover:bg-white transition"
          >
            <div className="truncate">
              <span className="font-bold text-gray-900 text-base">{fromCity}</span>
              <span className="text-xs text-gray-400 block truncate">
                {POPULAR_CITIES.find((c) => c.name === fromCity)?.state || 'India'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </div>

          {/* From Dropdown */}
          {fromOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 animate__animated animate__fadeIn">
              <input
                type="text"
                placeholder="Search city or state..."
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm border rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="max-h-56 overflow-y-auto space-y-1">
                {filteredFromCities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      setFromCity(city.name);
                      setFromOpen(false);
                      setFromFilter('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-blue-50 transition ${
                      fromCity === city.name ? 'bg-blue-50/80 font-bold text-primary' : 'text-gray-700'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{city.name}</span>
                      <span className="text-[11px] text-gray-400">{city.state}</span>
                    </div>
                    {fromCity === city.name && <Check className="w-4 h-4 text-primary" />}
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
            className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-primary hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 flex items-center justify-center shadow-sm hover:rotate-180 transform"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Destination City */}
        <div className="md:col-span-6 lg:col-span-6 relative" ref={toRef}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            To (Destination)
          </label>
          <div
            onClick={() => setToOpen(true)}
            className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-gray-200 hover:border-accent/60 cursor-pointer bg-gray-50/50 hover:bg-white transition"
          >
            <div className="truncate">
              <span className="font-bold text-gray-900 text-base">{toCity}</span>
              <span className="text-xs text-gray-400 block truncate">
                {POPULAR_CITIES.find((c) => c.name === toCity)?.state || 'India'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </div>

          {/* To Dropdown */}
          {toOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 animate__animated animate__fadeIn">
              <input
                type="text"
                placeholder="Search city or state..."
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm border rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <div className="max-h-56 overflow-y-auto space-y-1">
                {filteredToCities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      setToCity(city.name);
                      setToOpen(false);
                      setToFilter('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-orange-50 transition ${
                      toCity === city.name ? 'bg-orange-50/80 font-bold text-accent' : 'text-gray-700'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{city.name}</span>
                      <span className="text-[11px] text-gray-400">{city.state}</span>
                    </div>
                    {toCity === city.name && <Check className="w-4 h-4 text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Dates and Submit */}
      <div className="mt-3 lg:mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 lg:gap-4 items-end">
        {/* Journey Date */}
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Journey Date
          </label>
          <input
            type="date"
            min={todayStr}
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 hover:bg-white"
          />
        </div>

        {/* Return Date Optional Toggle */}
        <div className="md:col-span-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Return Date (Optional)
            </label>
            <button
              type="button"
              onClick={() => {
                setShowReturn(!showReturn);
                if (!showReturn && !returnDate) setReturnDate(journeyDate);
              }}
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              {showReturn ? 'Remove Return' : '+ Add Return'}
            </button>
          </div>

          {showReturn ? (
            <input
              type="date"
              min={journeyDate || todayStr}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50"
            />
          ) : (
            <div
              onClick={() => {
                setShowReturn(true);
                setReturnDate(journeyDate);
              }}
              className="px-3.5 py-3 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm cursor-pointer hover:border-primary/50 hover:text-primary transition text-center"
            >
              Click to select return date
            </div>
          )}
        </div>

        {/* Search Buses Button */}
        <div className="sm:col-span-2 md:col-span-4">
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover active:scale-[0.99] text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 group"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Search Buses</span>
          </button>
        </div>
      </div>

      {/* Popular Route Shortcuts */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-400 font-medium">Quick Pick Routes:</span>
        {[
          { from: 'Kolkata', to: 'Siliguri' },
          { from: 'Delhi', to: 'Jaipur' },
          { from: 'Mumbai', to: 'Pune' },
          { from: 'Bengaluru', to: 'Chennai' },
          { from: 'Delhi', to: 'Manali' }
        ].map((route, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setFromCity(route.from);
              setToCity(route.to);
            }}
            className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-primary font-medium transition text-[11px]"
          >
            {route.from} ➔ {route.to}
          </button>
        ))}
      </div>
    </form>
  );
};

export default BusSearchForm;
