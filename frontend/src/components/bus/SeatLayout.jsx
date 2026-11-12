import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Disc3, ShieldCheck, Heart, User, Sparkles, Check, Info } from 'lucide-react';

const SeatLayout = ({ bus }) => {
  const { selectedSeats, toggleSeat } = useBooking();
  const [activeDeck, setActiveDeck] = useState('lower');

  const hasUpperDeck = !!bus?.seats?.upper && bus.seats.upper.length > 0;
  const currentSeats = activeDeck === 'lower' ? bus?.seats?.lower || [] : bus?.seats?.upper || [];

  const isSelected = (seatNo) => selectedSeats.some((s) => s.number === seatNo);

  // Group seats by 4 columns (2 x aisle x 2) to recreate the DevIntelle mockup layout cleanly
  // In the reference: Left side has 2 seats (Seat 1, Seat 2), aisle, Right side has 2 seats (Seat 3, Seat 4)
  const rows = [];
  for (let i = 0; i < currentSeats.length; i += 4) {
    rows.push(currentSeats.slice(i, i + 4));
  }

  const renderSeatButton = (seat) => {
    if (!seat) return <div className="w-10 h-11" />;

    const booked = seat.status === 'booked';
    const selected = isSelected(seat.number);

    return (
      <button
        key={seat.number}
        type="button"
        disabled={booked}
        onClick={() => toggleSeat(seat)}
        title={`Seat ${seat.number} - ₹${seat.price} (${booked ? 'Booked' : selected ? 'Selected' : 'Available'})`}
        className={`w-10 h-11 rounded-lg border flex flex-col items-center justify-between p-1 transition-all duration-200 relative ${
          booked
            ? 'bg-purple-100/70 border-purple-200 text-purple-400 cursor-not-allowed'
            : selected
            ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-105 ring-2 ring-emerald-300'
            : 'bg-white border-slate-200 text-slate-700 hover:border-[#7E22CE] hover:bg-purple-50/40 shadow-xs'
        }`}
      >
        {/* Seat number */}
        <span className="text-[10px] font-bold leading-none">{seat.number}</span>

        {/* Seat cushion graphic indicator matching the DevIntelle laptop graphic */}
        <div
          className={`w-5 h-3.5 rounded-xs border transition-colors ${
            selected
              ? 'bg-white border-white'
              : booked
              ? 'bg-purple-200/90 border-purple-300'
              : 'bg-slate-50 border-slate-300'
          }`}
        ></div>

        {/* Small status dot */}
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            selected
              ? 'bg-white'
              : booked
              ? 'bg-purple-400'
              : 'bg-emerald-500'
          }`}
        ></div>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 p-6 sm:p-8">
      {/* Top Deck Switcher if double-decker */}
      {hasUpperDeck && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-purple-50 p-1.5 rounded-2xl border border-purple-100 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveDeck('lower')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeDeck === 'lower'
                  ? 'bg-[#3B0764] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#3B0764] hover:bg-white'
              }`}
            >
              <span>Lower Deck</span>
              <span className="text-[10px] opacity-80">({bus.seats.lower?.length} seats)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDeck('upper')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeDeck === 'upper'
                  ? 'bg-[#3B0764] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#3B0764] hover:bg-white'
              }`}
            >
              <span>Upper Deck</span>
              <span className="text-[10px] opacity-80">({bus.seats.upper?.length} seats)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modern Bus Cabin Frame (recreating the DevIntelle laptop bus frame) */}
      <div className="max-w-xs sm:max-w-sm mx-auto bg-gradient-to-b from-purple-50/70 via-white to-purple-50/40 border-2 border-purple-200/80 rounded-[2.5rem] p-5 shadow-inner relative">
        {/* Front cabin windshield & steering indicator */}
        <div className="bg-gradient-to-r from-purple-200/60 via-purple-100 to-purple-200/60 rounded-2xl p-3 mb-6 border border-purple-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3B0764]">
              Front Entry
            </span>
          </div>

          {/* Steering Wheel Indicator */}
          <div className="flex items-center gap-2 bg-white/80 px-2.5 py-1 rounded-full shadow-xs border border-purple-100">
            <span className="text-[10px] font-bold text-slate-600">Driver</span>
            <div className="w-5 h-5 rounded-full bg-[#3B0764] flex items-center justify-center text-white shadow-xs">
              <Disc3 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 2 x 2 Bus Rows with Central Walking Aisle */}
        <div className="space-y-3.5">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-between px-2">
              {/* Left pair (Window + Aisle) */}
              <div className="flex items-center gap-2.5">
                {renderSeatButton(row[0])}
                {renderSeatButton(row[1])}
              </div>

              {/* Central Aisle */}
              <div className="w-8 flex items-center justify-center">
                <span className="text-[9px] font-semibold text-purple-300 uppercase tracking-widest rotate-90">
                  Aisle
                </span>
              </div>

              {/* Right pair (Aisle + Window) */}
              <div className="flex items-center gap-2.5">
                {renderSeatButton(row[2])}
                {renderSeatButton(row[3])}
              </div>
            </div>
          ))}
        </div>

        {/* Rear of bus indicator */}
        <div className="text-center pt-6 mt-6 border-t-2 border-dashed border-purple-100">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
            Back of Bus
          </span>
        </div>
      </div>

      {/* Seat Color Code Legend Matching the DevIntelle Screenshot */}
      <div className="mt-8 pt-5 border-t border-purple-100 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-700">
        {/* Booked Status */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-400">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
          </div>
          <div>
            <span className="font-bold text-slate-800 block text-xs">Booked</span>
            <span className="text-[10px] text-slate-400">Unavailable</span>
          </div>
        </div>

        {/* Available Status */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div>
            <span className="font-bold text-slate-800 block text-xs">Available</span>
            <span className="text-[10px] text-slate-400">Ready to pick</span>
          </div>
        </div>

        {/* Selected Status */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 border border-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-emerald-700 block text-xs">Selected</span>
            <span className="text-[10px] text-slate-400">Your choice</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
