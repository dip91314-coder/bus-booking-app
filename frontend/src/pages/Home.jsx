import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BusSearchForm from '../components/bus/BusSearchForm';
import LeafletMap from '../components/common/LeafletMap';
import {
  POPULAR_ROUTES,
  FEATURED_DESTINATIONS,
  MOCK_TESTIMONIALS,
} from '../data/mockData';
import {
  ShieldCheck,
  Clock,
  Bus,
  ArrowRight,
  Star,
  CheckCircle2,
  Users,
  MapPin,
  Headphones,
  RotateCcw,
  CreditCard
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [mapOrigin, setMapOrigin] = useState('Kolkata');
  const [mapDest, setMapDest] = useState('Siliguri');

  const handleSelectCityFromMap = (cityName, type) => {
    if (type === 'origin') setMapOrigin(cityName);
    if (type === 'destination') setMapDest(cityName);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* HERO SECTION */}
      <section className="bg-[#0B1B3D] text-white pt-12 pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded border border-amber-400/20 mb-3">
              India's Intercity Bus Network
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Comfortable, reliable bus travel across India
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed max-w-2xl">
              Compare schedules, select lower and upper deck sleeper seats, and book tickets from verified operators with instant confirmation.
            </p>
          </div>

          {/* Search Form Container */}
          <div className="mt-6">
            <BusSearchForm />
          </div>

          {/* Quick Metrics */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
            <div>
              <p className="text-2xl font-bold text-white">250+</p>
              <p className="text-xs text-slate-400 mt-0.5">Connected Cities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1,200+</p>
              <p className="text-xs text-slate-400 mt-0.5">Daily Intercity Routes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.8 / 5</p>
              <p className="text-xs text-slate-400 mt-0.5">Passenger Satisfaction</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Verified Operators</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITIONS */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Why book your bus on YatraBus?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Clear fares, reliable amenities, and verified bus operators on every route.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Verified Fleet Partners</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Audited operators including Greenline, Royal Cruiser, Zingbus, and VRL Travels.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Live Seat Selection</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Choose single sleepers, double sleepers, or window seats with real-time deck views.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Easy Self-Service Cancellation</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Cancel tickets anytime with instant refund status updates and zero hidden penalties.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center mb-3">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">24x7 Transit Helpline</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Dedicated round-the-clock telephone and chat support for boarding assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR BUS ROUTES */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Popular Bus Routes
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Frequently booked intercity routes across major commercial corridors.
              </p>
            </div>
            <Link
              to="/routes"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition"
            >
              <span>View all routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_ROUTES.map((route) => (
              <div
                key={route.id}
                className="p-5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-medium text-slate-600">{route.duration}</span>
                    <span>{route.dailyBuses} daily departures</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {route.origin} <span className="text-slate-400">➔</span> {route.destination}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Via {route.via || 'National Highway Corridor'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Fares starting from</span>
                    <span className="text-base font-bold text-slate-900">₹{route.startingFare}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/buses?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(
                          route.destination
                        )}`
                      )
                    }
                    className="text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 transition"
                  >
                    View Buses
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Featured Travel Destinations
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Direct interstate bus connectivity to top hill stations, heritage hubs, and coastlines.
              </p>
            </div>
            <Link
              to="/destinations"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_DESTINATIONS.slice(0, 4).map((dest) => (
              <div
                key={dest.id}
                onClick={() => navigate(`/buses?destination=${encodeURIComponent(dest.name)}`)}
                className="group cursor-pointer rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-slate-300 transition shadow-sm"
              >
                <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {dest.state}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {dest.description}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{dest.routesCount || '15+'} routes</span>
                    <span className="font-semibold text-blue-700">Explore ➔</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROUTE MAP */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Intercity Bus Route Visualization
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore national highway connectivity and terminal stops via OpenStreetMap.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm p-4">
            <LeafletMap
              origin={mapOrigin}
              destination={mapDest}
              onCitySelect={handleSelectCityFromMap}
            />
          </div>
        </div>
      </section>

      {/* PASSENGER TESTIMONIALS */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Verified Passenger Experiences
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read real reviews from daily commuters and interstate travelers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TESTIMONIALS.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating) ? 'fill-current' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-slate-700 ml-1.5">{item.rating}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{item.comment}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.route}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMPLE CORPORATE FOOTER PROMO */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              Ready to plan your intercity journey?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Search routes, compare operator ratings, and confirm your seats in minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-md transition shadow-sm"
          >
            Search Buses Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
