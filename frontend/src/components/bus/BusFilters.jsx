import React from 'react';
import { Filter, RotateCcw, Clock, Star } from 'lucide-react';

const BusFilters = ({ filters, setFilters, onReset, minPrice = 300, maxPrice = 2500 }) => {
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

  const sliderMax = Math.max(maxPrice, 1000);
  const currentMaxPrice = typeof filters.maxPrice === 'number'
    ? Math.min(filters.maxPrice, sliderMax)
    : sliderMax;

  return (
    <div className="bg-white dark:bg-[#111622] rounded-2xl shadow-card border border-gray-100 dark:border-slate-800 p-5 space-y-6 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-700 dark:text-purple-400" />
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
            Filter Buses
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-semibold flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Bus Types: AC / Non-AC & Sleeper / Seater */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
          Bus Type
        </h4>
        <div className="space-y-2">
          {['AC Sleeper', 'Seater', 'Multi-Axle Volvo', 'Non-AC'].map((type) => (
            <label
              key={type}
              className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer hover:text-purple-700 dark:hover:text-purple-300 transition font-medium"
            >
              <input
                type="checkbox"
                checked={filters.busTypes?.includes(type)}
                onChange={() => handleCheckboxChange('busTypes', type)}
                className="w-4 h-4 rounded text-purple-700 focus:ring-purple-600 border-gray-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time Slots */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
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
                className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer ${
                  active
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                    : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">{slot.label}</div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500">{slot.range}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
            Max Price
          </h4>
          <span className="text-xs font-extrabold text-purple-700 dark:text-purple-400">
            ₹{currentMaxPrice.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={minPrice}
          max={sliderMax}
          step="50"
          value={currentMaxPrice}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
          }
          className="w-full accent-purple-700 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-1">
          <span>₹{minPrice}</span>
          <span>₹{sliderMax.toLocaleString()}</span>
        </div>
      </div>

      {/* Passenger Ratings */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {[4.5, 4.0, 3.5].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 cursor-pointer hover:text-purple-700 dark:hover:text-purple-300 transition font-medium"
            >
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === rating}
                onChange={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
                className="text-purple-700 focus:ring-purple-600 border-gray-300 dark:border-slate-700 dark:bg-slate-800"
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
