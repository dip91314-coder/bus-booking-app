import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { POPULAR_ROUTES } from '../data/mockData';
import { Search, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import RouteCard from '../components/bus/RouteCard';
import Chip from '../components/common/Chip';
import Button from '../components/common/Button';

const RoutesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'lowest-fare' | 'duration' | 'frequency'
  const [selectedTag, setSelectedTag] = useState('All');
  const [visibleCount, setVisibleCount] = useState(12);

  // Filter tag options
  const filterTags = ['All', 'Bestseller', 'High Frequency', 'Express Highway', 'Scenic Hills', 'Overnight', 'Heritage', 'Vacation'];

  // Tomorrow's date helper
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Filtered & Sorted routes
  const processedRoutes = useMemo(() => {
    let result = [...POPULAR_ROUTES];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.origin.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          (r.tag && r.tag.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (selectedTag !== 'All') {
      result = result.filter((r) => r.tag === selectedTag);
    }

    // Sort logic
    if (sortBy === 'lowest-fare') {
      result.sort((a, b) => {
        const fareA = parseInt(a.fare.replace(/[^0-9]/g, '')) || 0;
        const fareB = parseInt(b.fare.replace(/[^0-9]/g, '')) || 0;
        return fareA - fareB;
      });
    } else if (sortBy === 'duration') {
      result.sort((a, b) => {
        const durA = parseFloat(a.duration.replace('h', '.').replace('m', '')) || 0;
        const durB = parseFloat(b.duration.replace('h', '.').replace('m', '')) || 0;
        return durA - durB;
      });
    } else if (sortBy === 'frequency') {
      result.sort((a, b) => (b.busesCount || 0) - (a.busesCount || 0));
    }

    return result;
  }, [searchQuery, selectedTag, sortBy]);

  const handleRouteClick = (origin, destination) => {
    navigate(
      `/buses?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
        destination
      )}&date=${getTomorrowDate()}`
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTag('All');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors">
      {/* 1. HERO SECTION (Clean solid Navy-to-Purple gradient, max 240px tall) */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#5B21B6] text-white py-12 px-6 shadow-soft">
        <div className="max-w-[1200px] mx-auto text-center space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
            National Highway Transit Network
          </span>
          <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight text-white leading-tight">
            Interstate Highway Bus Routes
          </h1>
          <p className="text-base text-slate-200 max-w-xl mx-auto">
            Explore daily schedules, highway transit distances, durations, and verified coach operators across India.
          </p>
        </div>
      </div>

      {/* 2. SEARCH & TOOLBAR */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-6">
        <div className="bg-white rounded-card p-4 sm:p-5 shadow-soft border border-[#E2E8F0] space-y-4">
          {/* Top row: Search input + Live Clear */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search origin city, destination city, or highway name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-interactive bg-[#F8F7FC] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5B21B6] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#475569] flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bottom row: Filter Chips & Sort Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            {/* Filter chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#64748B] mr-1">Filter:</span>
              {filterTags.map((tag) => (
                <Chip
                  key={tag}
                  active={selectedTag === tag}
                  onClick={() => setSelectedTag(tag)}
                  size="sm"
                >
                  {tag}
                </Chip>
              ))}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
              <label htmlFor="sort-routes" className="text-xs font-semibold text-[#64748B]">
                Sort by:
              </label>
              <select
                id="sort-routes"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-[#F8F7FC] border border-[#E2E8F0] rounded-interactive px-3 py-2 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
              >
                <option value="popular">Popular Routes</option>
                <option value="lowest-fare">Lowest Starting Fare</option>
                <option value="duration">Shortest Travel Duration</option>
                <option value="frequency">Most Frequent Coaches</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RESULTS STATUS & GRID */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#475569]">
            Showing <span className="text-[#0F172A] font-bold">{processedRoutes.length}</span> highway routes
          </p>
          {(searchQuery || selectedTag !== 'All' || sortBy !== 'popular') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#5B21B6] hover:text-[#4C1D95] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {processedRoutes.length === 0 ? (
          <div className="bg-white rounded-card border border-[#E2E8F0] p-12 text-center space-y-4 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-[#F5F3FF] text-[#5B21B6] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">No Routes Found</h3>
              <p className="text-sm text-[#64748B] mt-1 max-w-sm mx-auto">
                We couldn't find any bus corridors matching "{searchQuery}". Try searching for another major city.
              </p>
            </div>
            <Button variant="secondary" onClick={handleResetFilters}>
              Clear Search & Reset
            </Button>
          </div>
        ) : (
          /* 2-Column Desktop, 1-Column Mobile Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedRoutes.slice(0, visibleCount).map((r, idx) => (
              <RouteCard
                key={idx}
                route={r}
                onBook={() => handleRouteClick(r.origin, r.destination)}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {processedRoutes.length > visibleCount && (
          <div className="mt-8 text-center">
            <Button
              variant="secondary"
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="min-h-[44px] px-8"
            >
              Load More Routes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutesPage;
