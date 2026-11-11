import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Ticket, X, Tag, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FareSummaryCard = ({ onContinue, buttonText = 'Continue to Passenger Details', disabled = false }) => {
  const { selectedBus, selectedSeats, toggleSeat, selectedBoardingPoint, selectedDroppingPoint } = useBooking();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const seatCount = selectedSeats.length;
  const baseFare = selectedSeats.reduce((acc, curr) => acc + (curr.price || selectedBus?.fare || 0), 0);
  const gst = Math.round(baseFare * 0.05); // 5% GST
  const total = Math.max(0, baseFare + gst - discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'BHARAT100') {
      setDiscount(100);
      setAppliedCoupon('BHARAT100');
      toast.success('Coupon BHARAT100 applied! ₹100 discount added.');
    } else if (coupon.trim().toUpperCase() === 'FIRSTTRIP') {
      const disc = Math.round(baseFare * 0.1);
      setDiscount(disc);
      setAppliedCoupon('FIRSTTRIP');
      toast.success(`Coupon FIRSTTRIP applied! ₹${disc} discount added.`);
    } else {
      toast.error('Invalid coupon code. Try BHARAT100 or FIRSTTRIP');
    }
  };

  if (!selectedBus) return null;

  return (
    <div className="bg-white rounded-2xl shadow-elevated border border-blue-100 p-5 sticky top-24 space-y-5">
      {/* Card Title */}
      <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" /> Booking Summary
        </h3>
        <span className="text-xs bg-blue-50 text-primary font-bold px-2 py-0.5 rounded-full">
          {seatCount} {seatCount === 1 ? 'Seat' : 'Seats'}
        </span>
      </div>

      {/* Selected Bus Brief */}
      <div>
        <p className="font-extrabold text-gray-900 text-sm">{selectedBus.operator}</p>
        <p className="text-xs text-gray-500 font-medium">
          {selectedBus.origin} ➔ {selectedBus.destination}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
          <span>{selectedBus.departureTime}</span>
          <span>•</span>
          <span>{selectedBus.busType}</span>
        </div>
      </div>

      {/* Selected Seats Chips */}
      <div>
        <span className="text-xs font-bold text-gray-600 block mb-1.5">Selected Seats:</span>
        {seatCount === 0 ? (
          <div className="p-3 bg-blue-50/60 rounded-xl text-xs text-blue-700 flex items-center gap-2 border border-blue-100">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span>Please click on an available seat from the bus layout to proceed.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedSeats.map((seat) => (
              <span
                key={seat.number}
                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg"
              >
                <span>Seat {seat.number}</span>
                <span className="text-[10px] text-emerald-600">₹{seat.price}</span>
                <button
                  type="button"
                  onClick={() => toggleSeat(seat)}
                  className="hover:text-red-500 transition"
                  title="Remove seat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Boarding & Dropping Points Preview */}
      {(selectedBoardingPoint || selectedDroppingPoint) && (
        <div className="text-xs space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          {selectedBoardingPoint && (
            <p className="truncate text-gray-700">
              <strong className="text-gray-900">Boarding:</strong> {selectedBoardingPoint.name} ({selectedBoardingPoint.time})
            </p>
          )}
          {selectedDroppingPoint && (
            <p className="truncate text-gray-700">
              <strong className="text-gray-900">Dropping:</strong> {selectedDroppingPoint.name} ({selectedDroppingPoint.time})
            </p>
          )}
        </div>
      )}

      {/* Promo Code Input */}
      <form onSubmit={handleApplyCoupon} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Promo code (BHARAT100)"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs uppercase tracking-wider rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-50 text-primary hover:bg-primary hover:text-white font-bold text-xs px-3 py-2 rounded-xl border border-blue-200 transition"
        >
          Apply
        </button>
      </form>

      {appliedCoupon && (
        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Coupon {appliedCoupon} applied successfully!
        </p>
      )}

      {/* Fare Calculation */}
      <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Base Fare ({seatCount} {seatCount === 1 ? 'ticket' : 'tickets'}):</span>
          <span className="font-bold text-gray-800">₹{baseFare}</span>
        </div>
        <div className="flex justify-between">
          <span>Govt. GST & Bus Taxes (5%):</span>
          <span className="font-bold text-gray-800">₹{gst}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Special Promotional Discount:</span>
            <span>- ₹{discount}</span>
          </div>
        )}
        <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
          <span>Total Payable:</span>
          <span className="text-xl text-primary font-sans">₹{total}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={disabled || seatCount === 0}
        onClick={onContinue}
        className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 ${
          disabled || seatCount === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-accent hover:bg-accent-hover active:scale-[0.99] text-white shadow-orange-500/25'
        }`}
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Safe & Secure Simulated Checkout</span>
      </div>
    </div>
  );
};

export default FareSummaryCard;
