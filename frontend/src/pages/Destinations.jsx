import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURED_DESTINATIONS, POPULAR_CITIES } from '../data/mockData';
import { MapPin, Search, ArrowRight, Compass, Sparkles } from 'lucide-react';

const Destinations = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const filtered = FEATURED_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(filter.toLowerCase()) ||
      d.state.toLowerCase().includes(filter.toLowerCase()) ||
      d.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#071A4D] via-[#0C247A] to-primary text-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-lg">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Destination Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Discover Incredible India by Bus
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            From misty Himalayan valleys and golden desert citadels to sacred ghats and coastal beaches, travel comfortably with verified coach operators.
          </p>

          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by city, state, or attraction..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-gray-900 text-xs font-bold placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dest, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl shadow-card hover:shadow-elevated border border-gray-100 overflow-hidden group transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-56 w-full overflow-hidden relative">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                      {dest.state}
                    </span>
                    <h3 className="text-2xl font-black mt-1">{dest.name}</h3>
                    <p className="text-xs text-gray-200">{dest.title}</p>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">{dest.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Connected from Kolkata, Delhi, Mumbai, Bengaluru</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Starting Fare</span>
                    <span className="text-base font-black text-primary font-sans">{dest.minFare}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/buses?destination=${encodeURIComponent(dest.name)}&origin=Kolkata&date=${
                          new Date().toISOString().split('T')[0]
                        }`
                      )
                    }
                    className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <span>View Buses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Destinations;

