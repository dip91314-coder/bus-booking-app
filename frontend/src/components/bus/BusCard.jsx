import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import {
  Bus,
  Clock,
  Star,
  Wifi,
  Zap,
  Droplets,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Tv,
  ArrowRight
} from 'lucide-react';

const BusCard = ({ bus }) => {
  const navigate = useNavigate();
  const { setSelectedBus } = useBooking();
  const [showDetails, setShowDetails] = useState(false);

  const handleSelectSeats = () => {
    setSelectedBus(bus);
    navigate(`/bus/${bus.tripId || bus.id || bus._id}/seats`);
  };

  const getAmenityIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-3 h-3 text-slate-500" />;
      case 'charging point':
      case 'usb charging':
        return <Zap className="w-3 h-3 text-amber-500" />;
      case 'water bottle':
        return <Droplets className="w-3 h-3 text-blue-500" />;
      case 'movie entertainment':
        return <Tv className="w-3 h-3 text-slate-500" />;
      default:
        return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111622] rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition mb-4 overflow-hidden">
      <div className="p-5">
        {/* Top Meta: Operator, Bus Type, Rating */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {bus.operator}
              </h3>
              {bus.hasLiveTracking && (
                <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Live Tracking
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {bus.busName} • <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{bus.busNumber}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {bus.busType}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{bus.rating}</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">({bus.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Schedule & Route Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4">
          {/* Departure */}
          <div className="md:col-span-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{bus.departureTime}</div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{bus.origin}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
              {bus.boardingPoints?.[0]?.name || 'Origin Bus Stand'}
            </p>
          </div>

          {/* Duration Timeline */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              {bus.journeyDuration}
            </span>
            <div className="w-full flex items-center justify-center relative my-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <Bus className="w-3.5 h-3.5 text-slate-400 mx-0.5" />
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-slate-300"></div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Non-Stop Intercity</span>
          </div>

          {/* Arrival */}
          <div className="md:col-span-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{bus.arrivalTime}</div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{bus.destination}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
              {bus.droppingPoints?.[0]?.name || 'Destination Terminal'}
            </p>
          </div>

          {/* Price & Booking Button */}
          <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="text-left md:text-right">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Starting from</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                ₹{bus.price || bus.fare}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">+ taxes</span>
            </div>

            <div className="mt-2 text-right">
              <span className={`text-xs font-medium block mb-1.5 ${
                (bus.availableSeats ?? bus.availableSeatsCount ?? 20) <= 5
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {bus.availableSeats ?? bus.availableSeatsCount ?? 20} seats available
              </span>
              <button
                type="button"
                onClick={handleSelectSeats}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-md transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Select Seats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Amenities Bar & Toggle */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {bus.amenities?.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#161D2E] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800"
              >
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium flex items-center gap-1"
          >
            {showDetails ? 'Hide Details' : 'Boarding & Dropping Points'}
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Points Drawer */}
      {showDetails && (
        <div className="bg-slate-50 dark:bg-[#0E1526] border-t border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Boarding */}
            <div className="bg-white dark:bg-[#111622] p-3 rounded-md border border-slate-200 dark:border-slate-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Boarding Points
              </h5>
              <ul className="space-y-1.5">
                {bus.boardingPoints?.map((bp) => (
                  <li key={bp.id} className="flex items-start justify-between">
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{bp.name}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{bp.landmark}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white ml-2">{bp.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dropping */}
            <div className="bg-white dark:bg-[#111622] p-3 rounded-md border border-slate-200 dark:border-slate-800">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Dropping Points
              </h5>
              <ul className="space-y-1.5">
                {bus.droppingPoints?.map((dp) => (
                  <li key={dp.id} className="flex items-start justify-between">
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{dp.name}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{dp.landmark}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white ml-2">{dp.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCard;
