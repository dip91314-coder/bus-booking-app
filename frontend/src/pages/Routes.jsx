import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { POPULAR_ROUTES } from '../data/mockData';
import { Bus, ArrowRight, Clock, MapPin, Search } from 'lucide-react';

const Routes = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = POPULAR_ROUTES.filter(
    (r) =>
      r.origin.toLowerCase().includes(query.toLowerCase()) ||
      r.destination.toLowerCase().includes(query.toLowerCase()) ||
      r.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      <div className="bg-gradient-to-r from-[#071A4D] via-[#0C247A] to-primary text-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-lg">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            National Route Network
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Interstate Highway Bus Routes
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Explore daily schedules, route distances, travel durations, and guaranteed seat fares across India.
          </p>

          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search origin or destination city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-gray-900 text-xs font-bold placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 shadow-card hover:shadow-elevated border border-gray-100 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-primary px-2.5 py-0.5 rounded-full">
                    {r.tag}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{r.distance}</span>
                </div>

                <div className="flex items-center gap-2 text-lg font-black text-gray-900 mb-2">
                  <span>{r.origin}</span>
                  <ArrowRight className="w-4 h-4 text-accent" />
                  <span>{r.destination}</span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Average Travel Time: <strong>{r.duration}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Bus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Daily Frequency: <strong>{r.busesCount} Scheduled Coaches</strong></span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Starting Fare</span>
                  <span className="text-base font-black text-primary font-sans">{r.fare}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/buses?origin=${encodeURIComponent(r.origin)}&destination=${encodeURIComponent(
                        r.destination
                      )}&date=${new Date().toISOString().split('T')[0]}`
                    )
                  }
                  className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
                >
                  Book Bus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Routes;

