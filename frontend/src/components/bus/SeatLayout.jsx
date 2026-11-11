import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Disc3, ShieldCheck, Heart, User, Sparkles } from 'lucide-react';

const SeatLayout = ({ bus }) => {
  const { selectedSeats, toggleSeat } = useBooking();
  const [activeDeck, setActiveDeck] = useState('lower');

  const hasUpperDeck = !!bus.seats?.upper && bus.seats.upper.length > 0;
  const currentSeats = activeDeck === 'lower' ? bus.seats?.lower || [] : bus.seats?.upper || [];

  const isSelected = (seatNo) => selectedSeats.some((s) => s.number === seatNo);

  const getSeatBadgeColor = (seat) => {
    if (seat.status === 'booked') {
      return 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed';
    }
    if (isSelected(seat.number)) {
      return 'bg-emerald-500 border-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-300';
    }
    if (seat.isLadies) {
      return 'bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100 hover:border-pink-400';
    }
    return 'bg-white border-blue-200 text-gray-800 hover:border-primary hover:bg-blue-50/50 shadow-sm';
  };

  return (
    <div className="bg-white rounded-2xl shadow-elevated border border-blue-100 p-4 sm:p-6">
      {/* Top Deck Switcher if double-decker */}
      {hasUpperDeck && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-blue-50 p-1.5 rounded-xl border border-blue-200 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveDeck('lower')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeDeck === 'lower'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-primary hover:bg-white'
              }`}
            >
              <span>Lower Deck</span>
              <span className="text-[10px] opacity-80">({bus.seats.lower?.length} berths)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDeck('upper')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeDeck === 'upper'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-primary hover:bg-white'
              }`}
            >
              <span>Upper Deck</span>
              <span className="text-[10px] opacity-80">({bus.seats.upper?.length} berths)</span>
            </button>
          </div>
        </div>
      )}

      {/* Bus physical container */}
      <div className="max-w-md mx-auto bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 shadow-inner relative">
        {/* Front of Bus indicator */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed border-slate-300">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Front of Coach</span>
          </div>

          {/* Steering Wheel Indicator */}
          <div className="flex items-center gap-2 bg-slate-200/80 px-3 py-1 rounded-full text-slate-700 text-xs font-semibold">
            <span>Driver</span>
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white shadow">
              <Disc3 className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {currentSeats.map((seat) => {
            const booked = seat.status === 'booked';
            const selected = isSelected(seat.number);

            return (
              <button
                key={seat.number}
                type="button"
                disabled={booked}
                onClick={() => toggleSeat(seat)}
                className={`h-16 rounded-xl border-2 p-1.5 flex flex-col justify-between items-center transition-all duration-200 ${getSeatBadgeColor(
                  seat
                )} ${seat.type === 'double' ? 'col-span-1' : 'col-span-1'}`}
                title={`Seat ${seat.number} - ₹${seat.price} (${seat.status})`}
              >
                {/* Seat headrest & Ladies icon */}
                <div className="w-full flex items-center justify-between px-1">
                  <span className="text-[10px] font-black">{seat.number}</span>
                  {seat.isLadies && !booked && (
                    <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                  )}
                </div>

                {/* Seat Type Graphic */}
                <div className="w-full flex items-center justify-center">
                  <div
                    className={`h-2 w-7 rounded-sm ${
                      selected ? 'bg-white' : booked ? 'bg-slate-400' : 'bg-blue-200'
                    }`}
                  ></div>
                </div>

                {/* Price */}
                <span className="text-[10px] font-bold">
                  {booked ? 'Booked' : `₹${seat.price}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Back of bus */}
        <div className="text-center pt-5 mt-4 border-t border-dashed border-slate-300">
          <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
            Rear of Coach
          </span>
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border-2 border-blue-200 bg-white"></div>
          <span className="font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500 border-2 border-emerald-600 shadow-sm"></div>
          <span className="font-bold text-emerald-800">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-300 border-2 border-slate-300"></div>
          <span className="font-medium text-slate-500">Booked / Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-pink-50 border-2 border-pink-300 flex items-center justify-center text-pink-500">
            <Heart className="w-3 h-3 fill-pink-500" />
          </div>
          <span className="font-medium text-pink-700">Ladies Seat</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
