import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Ticket, X, ShieldCheck, ArrowRight, CheckCircle2, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const FareSummaryCard = ({ onContinue, buttonText = 'Book Now', disabled = false }) => {
  const { selectedBus, selectedSeats, toggleSeat, selectedBoardingPoint, selectedDroppingPoint, searchParams } = useBooking();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const seatCount = selectedSeats.length;
  const baseFare = selectedSeats.reduce((acc, curr) => acc + (curr.price || selectedBus?.fare || 0), 0);
  const gst = Math.round(baseFare * 0.05); // 5% GST
  const total = Math.max(0, baseFare + gst - discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'PURPLE15') {
      const disc = Math.round(baseFare * 0.15);
      setDiscount(disc);
      setAppliedCoupon('PURPLE15');
      toast.success(`Coupon PURPLE15 applied! ₹${disc} discount added.`);
    } else if (coupon.trim().toUpperCase() === 'RETURN100') {
      setDiscount(100);
      setAppliedCoupon('RETURN100');
      toast.success('Coupon RETURN100 applied! ₹100 discount added.');
    } else {
      toast.error('Invalid coupon code. Try PURPLE15 or RETURN100');
    }
  };

  if (!selectedBus) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 p-6 sm:p-7 sticky top-24 space-y-6">
      {/* Header Info mirroring the DevIntelle sidebar */}
      <div className="pb-4 border-b border-purple-50 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#7E22CE] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
            Booking Overview
          </span>
          <h3 className="text-base font-extrabold text-[#3B0764] mt-1">
            Trip Summary
          </h3>
        </div>
        <span className="text-xs bg-[#3B0764] text-white font-bold px-3 py-1 rounded-full shadow-xs">
          {seatCount} {seatCount === 1 ? 'Seat' : 'Seats'}
        </span>
      </div>

      {/* Specifications list matching DevIntelle sidebar */}
      <div className="space-y-3 text-xs">
        {/* Journey Point */}
        <div className="flex items-center justify-between py-1 border-b border-dashed border-purple-50">
          <span className="text-slate-500 font-medium">Journey Point:</span>
          <span className="font-extrabold text-slate-800">
            {selectedBus.origin} - {selectedBus.destination}
          </span>
        </div>

        {/* Total Fare */}
        <div className="flex items-center justify-between py-1 border-b border-dashed border-purple-50">
          <span className="text-slate-500 font-medium">Total Fare:</span>
          <span className="font-extrabold text-[#3B0764] text-sm">
            ₹{total}
          </span>
        </div>

        {/* Seats */}
        <div className="flex items-center justify-between py-1 border-b border-dashed border-purple-50">
          <span className="text-slate-500 font-medium">Seats:</span>
          <span className="font-extrabold text-emerald-600">
            {seatCount > 0
              ? selectedSeats.map((s) => `Seat ${s.number}`).join(', ')
              : 'None selected'}
          </span>
        </div>

        {/* Booking Ref */}
        <div className="flex items-center justify-between py-1 border-b border-dashed border-purple-50">
          <span className="text-slate-500 font-medium">Booking Ref:</span>
          <span className="font-mono font-bold text-slate-700 uppercase">
            REF{selectedBus.id ? selectedBus.id.slice(0, 6).toUpperCase() : '771248'}
          </span>
        </div>

        {/* Departure Time */}
        <div className="flex items-center justify-between py-1 border-b border-dashed border-purple-50">
          <span className="text-slate-500 font-medium">Dept. Time:</span>
          <span className="font-bold text-slate-800">{selectedBus.departureTime}</span>
        </div>

        {/* Service Class */}
        <div className="flex items-center justify-between py-1 border-b border-dashed border-purple-50">
          <span className="text-slate-500 font-medium">Service Class:</span>
          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            {selectedBus.busType || 'Express'}
          </span>
        </div>

        {/* Journey Date */}
        <div className="flex items-center justify-between py-1 border-b border-dashed border-purple-50">
          <span className="text-slate-500 font-medium">Journey Date:</span>
          <span className="font-bold text-slate-800">
            {searchParams.journeyDate || new Date().toISOString().split('T')[0]}
          </span>
        </div>
      </div>

      {/* Selected Seat Tag Badges with easy cancellation */}
      {seatCount > 0 && (
        <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
          <span className="text-[11px] font-bold text-[#3B0764] block mb-2">Picked Berths:</span>
          <div className="flex flex-wrap gap-1.5">
            {selectedSeats.map((seat) => (
              <span
                key={seat.number}
                className="inline-flex items-center gap-1.5 bg-white text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs"
              >
                <span>Seat {seat.number}</span>
                <span className="text-[10px] text-slate-400">₹{seat.price}</span>
                <button
                  type="button"
                  onClick={() => toggleSeat(seat)}
                  className="hover:text-rose-500 transition ml-0.5"
                  title="Remove seat"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Button ("Book Now") styled exactly like the DevIntelle purple pill */}
      <div>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled || seatCount === 0}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            disabled || seatCount === 0
              ? 'bg-purple-300 cursor-not-allowed shadow-none'
              : 'bg-[#7E22CE] hover:bg-[#6B21A8] active:scale-[0.99] shadow-purple-900/20'
          }`}
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-2.5">
          Instant confirmation with zero booking fee
        </p>
      </div>
    </div>
  );
};

export default FareSummaryCard;
