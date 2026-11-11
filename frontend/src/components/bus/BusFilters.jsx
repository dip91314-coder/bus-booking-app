import React from 'react';
import { Filter, RotateCcw, Clock, ShieldCheck, Star } from 'lucide-react';
import { BUS_OPERATORS } from '../../data/mockData';

const BusFilters = ({ filters, setFilters, onReset }) => {
  const handleCheckboxChange = (category, value) => {
    setFilters((prev) => {
      const currentList = prev[category] || [];
      const exists = currentList.includes(value);
      return {
        ...prev,
        [category]: exists ? currentList.filter((item) => item !== value) : [...currentList, value]
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">
            Filter Buses
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-primary hover:text-accent font-semibold flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Bus Types: AC / Non-AC & Sleeper / Seater */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          Bus Type
        </h4>
        <div className="space-y-2">
          {['AC Sleeper', 'Seater', 'Multi-Axle Volvo', 'Non-AC'].map((type) => (
            <label
              key={type}
              className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-primary transition font-medium"
            >
              <input
                type="checkbox"
                checked={filters.busTypes?.includes(type)}
                onChange={() => handleCheckboxChange('busTypes', type)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time Slots */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          Departure Time
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'morning', label: 'Morning', range: '06:00 - 12:00' },
            { id: 'afternoon', label: 'Afternoon', range: '12:00 - 18:00' },
            { id: 'evening', label: 'Evening', range: '18:00 - 24:00' },
            { id: 'night', label: 'Night', range: '00:00 - 06:00' }
          ].map((slot) => {
            const active = filters.timeSlots?.includes(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleCheckboxChange('timeSlots', slot.id)}
                className={`p-2 rounded-xl text-left border text-xs transition ${
                  active
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{slot.label}</div>
                <div className="text-[10px] text-gray-400">{slot.range}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Max Price
          </h4>
          <span className="text-xs font-extrabold text-primary">
            ₹{filters.maxPrice || 2500}
          </span>
        </div>
        <input
          type="range"
          min="300"
          max="2500"
          step="50"
          value={filters.maxPrice || 2500}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
          }
          className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>₹300</span>
          <span>₹2,500</span>
        </div>
      </div>

      {/* Operators Filter */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          Bus Operators
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {BUS_OPERATORS.map((op) => (
            <label
              key={op}
              className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-primary transition font-medium"
            >
              <input
                type="checkbox"
                checked={filters.operators?.includes(op)}
                onChange={() => handleCheckboxChange('operators', op)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
              />
              <span className="truncate">{op}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Passenger Ratings */}
      <div className="pt-2 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {[4.5, 4.0, 3.5].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-primary transition font-medium"
            >
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === rating}
                onChange={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
                className="text-primary focus:ring-primary"
              />
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating} & above</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusFilters;
