import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  User,
  Ticket,
  BookmarkCheck,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Bus,
  ArrowRight,
  ShieldCheck,
  XCircle,
  BookOpen,
  Camera,
  Sparkles,
  Share2,
  Award,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import JournalSpreadCarousel from '../components/ui/journal-spread-carousel';
import { travelSpreadsData } from '../data/travelJournals';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const {
    bookings,
    cancelBooking,
    savedTravellers,
    addSavedTraveller,
    deleteSavedTraveller
  } = useBooking();

  const activeTab = searchParams.get('tab') || 'bookings';

  // Profile Edit modal state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || 'Rahul Sen');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '9876543210');

  // Add traveller modal state
  const [addTravellerOpen, setAddTravellerOpen] = useState(false);
  const [newTraveller, setNewTraveller] = useState({ name: '', age: '', gender: 'male', phone: '' });

  // Travel Journal state
  const [spreads, setSpreads] = useState(travelSpreadsData);
  const [newMemoryOpen, setNewMemoryOpen] = useState(false);
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryLocation, setNewMemoryLocation] = useState('');
  const [newMemoryStory, setNewMemoryStory] = useState('');

  // Filter user bookings
  const upcomingBookings = bookings.filter((b) => b.bookingStatus === 'confirmed');
  const pastBookings = bookings.filter((b) => b.bookingStatus === 'completed');
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'cancelled');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfile({ name: profileName, phone: profilePhone });
    toast.success('Passenger profile updated successfully!');
    setEditProfileOpen(false);
  };

  const handleAddTravellerSubmit = (e) => {
    e.preventDefault();
    if (!newTraveller.name || newTraveller.name.trim().length < 2) {
      toast.error('Please enter a valid traveller name.');
      return;
    }
    if (!newTraveller.age || isNaN(newTraveller.age) || Number(newTraveller.age) < 1) {
      toast.error('Please enter a valid age.');
      return;
    }

    addSavedTraveller({
      name: newTraveller.name,
      age: Number(newTraveller.age),
      gender: newTraveller.gender,
      phone: newTraveller.phone || user?.phone || '9876543210'
    });

    toast.success(`Traveller "${newTraveller.name}" added to saved list!`);
    setNewTraveller({ name: '', age: '', gender: 'male', phone: '' });
    setAddTravellerOpen(false);
  };

  const handleAddMemorySubmit = (e) => {
    e.preventDefault();
    if (!newMemoryTitle.trim() || !newMemoryStory.trim()) {
      toast.error('Please enter a title and a story for your memory.');
      return;
    }

    const newSpread = {
      id: `custom-memory-${Date.now()}`,
      label: newMemoryTitle,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
      alt: newMemoryLocation || 'My Travel Destination',
      paper: '#1e293b',
      prints: [
        {
          src: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
          caption: newMemoryLocation || 'Journey Snapshot',
          x: 14,
          y: 20,
          w: 26,
          rotate: -3,
          tape: true
        }
      ],
      notes: [
        {
          x: 54,
          y: 16,
          w: 36,
          title: newMemoryTitle,
          body: newMemoryStory,
          rotate: 1,
          style: 'card'
        }
      ]
    };

    setSpreads([newSpread, ...spreads]);
    toast.success('New travel memory added to your Journal!');
    setNewMemoryTitle('');
    setNewMemoryLocation('');
    setNewMemoryStory('');
    setNewMemoryOpen(false);
  };

  const handleJournalAction = (action, index) => {
    const current = spreads[index];
    if (action === 'share') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        toast.success(`Link to "${current?.label || 'Travel Journal'}" copied to clipboard!`);
      } else {
        toast.success(`Spread shared: ${current?.label}`);
      }
    } else if (action === 'add') {
      setNewMemoryOpen(true);
    } else if (action === 'delete') {
      if (spreads.length <= 1) {
        toast.error('You need to keep at least one travel memory.');
        return;
      }
      setSpreads(spreads.filter((_, i) => i !== index));
      toast.success(`Deleted spread "${current?.label}".`);
    } else {
      toast(`Action ${action} for spread "${current?.label}"`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Dashboard Top Header */}
      <div className="bg-gradient-to-r from-[#2A054E] via-[#3B0764] to-[#4C0E82] text-white py-9 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=140&q=80'}
                alt={user?.name || 'User'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#2A054E]" title="Active" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Rahul Sen'}</h1>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-wide flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-300" />
                  Verified Passenger
                </span>
                <span className="text-[10px] bg-purple-400/20 text-purple-200 font-bold px-2.5 py-0.5 rounded-full border border-purple-400/30 uppercase tracking-wide flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-300" />
                  Gold Tier Member
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                {user?.email || 'rahul.sen@example.com'} • +91 {user?.phone || '9876543210'}
              </p>
              <p className="text-[11px] text-purple-300 mt-1 flex items-center gap-2">
                <span>Member since {user?.memberSince || '2025'}</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Travel Rewards: 450 Express Miles
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setNewMemoryOpen(true)}
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-400/30 transition flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Add Memory</span>
            </button>
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Profile</span>
            </button>
            <Link
              to="/buses"
              className="bg-[#9333EA] hover:bg-[#7E22CE] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Book New Bus</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Trips</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{upcomingBookings.length}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">Confirmed & Active</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pastBookings.length}</h3>
              <p className="text-[10px] text-slate-500 font-medium">Safe Journeys logged</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Travellers</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{savedTravellers.length}</h3>
              <p className="text-[10px] text-blue-600 font-bold">Quick-fill companions</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Journal Memories</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{spreads.length}</h3>
              <p className="text-[10px] text-amber-600 font-bold">3D Spreads Recorded</p>
            </div>
          </div>
        </div>

        {/* Feature Showcase: Travel Journal 3D Spread Carousel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-purple-100/80 overflow-hidden relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Travel Memories & Journey Journal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Relive Your Scenic Bus Adventures Across India
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Flip through polaroids, travel notes, washi tape clippings, and mountain passes captured across your journeys.
                Drag to flip spreads, tap to zoom, or flick left and right.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewMemoryOpen(true)}
                className="bg-purple-50 hover:bg-purple-100 text-[#7E22CE] text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-purple-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Entry</span>
              </button>
              <Link
                to="/popular-trips"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <span>Explore Popular Routes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive 3D Journal Spread Carousel */}
          <div className="pt-6">
            <JournalSpreadCarousel
              spreads={spreads}
              title="Indian Road Trip Journal"
              meta={`${spreads.length} curated double-page spreads`}
              height="480px"
              initialIndex={0}
              autoPlay={false}
              onAction={handleJournalAction}
              className="rounded-2xl shadow-inner bg-slate-950/5 border border-slate-200/50"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-purple-100">
          {[
            { id: 'bookings', label: 'Upcoming Journeys', count: upcomingBookings.length, icon: <Ticket className="w-4 h-4" /> },
            { id: 'completed', label: 'Past Journeys', count: pastBookings.length, icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: 'cancelled', label: 'Cancelled Bookings', count: cancelledBookings.length, icon: <XCircle className="w-4 h-4" /> },
            { id: 'travellers', label: 'Saved Travellers', count: savedTravellers.length, icon: <BookmarkCheck className="w-4 h-4" /> },
            { id: 'journal', label: 'Travel Memories', count: spreads.length, icon: <BookOpen className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-[#3B0764] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-purple-50/60 border border-purple-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-purple-50 text-[#7E22CE]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab 1: Upcoming Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((b) => (
                <div
                  key={b.pnr}
                  className="bg-white rounded-2xl p-6 shadow-card hover:shadow-hover border border-gray-100 transition duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-primary bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          PNR: {b.pnr}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Confirmed 🟢
                        </span>
                      </div>
                      <h3 className="text-base font-black text-gray-900 mt-2">{b.operator}</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {b.busName} • {b.busType}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-400 block">Total Fare Paid</span>
                      <span className="text-xl font-black text-primary font-sans">₹{b.totalFare}</span>
                      <span className="text-[10px] text-gray-400 block">
                        via {b.paymentMethod || 'Simulated Payment'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700 bg-gray-50/60 p-4 rounded-xl border border-gray-100 mb-4">
                    <div>
                      <span className="text-gray-400 block font-medium">Route & Schedule</span>
                      <p className="font-extrabold text-gray-900 mt-0.5">
                        {b.origin} ➔ {b.destination}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        Departure: <strong>{b.departureTime}</strong> ({b.journeyDate})
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Boarding Point</span>
                      <p className="font-bold text-gray-900 mt-0.5">{b.boardingPoint}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Seats & Passengers</span>
                      <p className="font-extrabold text-emerald-700 mt-0.5">
                        Seats: {b.seats?.join(', ')} ({b.passengers?.length || b.seats?.length} Passengers)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-gray-400 font-medium">
                      Booked on: {new Date(b.bookedAt || Date.now()).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel booking ${b.pnr}?`)) {
                            cancelBooking(b.pnr);
                            toast.success(`Booking ${b.pnr} has been cancelled.`);
                          }
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition"
                      >
                        Cancel Booking
                      </button>
                      <Link
                        to={`/booking/confirmation/${b.pnr}`}
                        className="text-xs font-bold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>View / Print Ticket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-gray-100 space-y-3">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No Upcoming Bookings</h3>
                <p className="text-xs text-gray-500">
                  Ready to plan your next journey? Search across 250+ Indian destinations.
                </p>
                <Link
                  to="/buses"
                  className="bg-accent text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-block mt-2"
                >
                  Search Available Buses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Past Completed Journeys */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((b) => (
                <div
                  key={b.pnr}
                  className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 opacity-90"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-bold text-gray-500">PNR: {b.pnr}</span>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Journey Completed
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900">{b.operator}</h4>
                  <p className="text-xs text-gray-500">
                    {b.origin} ➔ {b.destination} • {b.journeyDate} • Seats: {b.seats?.join(', ')}
                  </p>
                  <div className="mt-3 pt-3 border-t flex justify-end">
                    <Link
                      to={`/booking/confirmation/${b.pnr}`}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      View Invoice Receipt
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-gray-100">
                <p className="text-xs text-gray-500">No completed journeys recorded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Cancelled Bookings */}
        {activeTab === 'cancelled' && (
          <div className="space-y-4">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map((b) => (
                <div
                  key={b.pnr}
                  className="bg-white rounded-2xl p-5 shadow-card border border-red-100"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono font-bold text-gray-500">PNR: {b.pnr}</span>
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                      Cancelled & Refunded
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900">{b.operator}</h4>
                  <p className="text-xs text-gray-500">
                    {b.origin} ➔ {b.destination} • Journey Date: {b.journeyDate}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                    Simulated Refund of ₹{b.totalFare} credited to original payment source.
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-gray-100">
                <p className="text-xs text-gray-500">No cancelled bookings.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Saved Travellers */}
        {activeTab === 'travellers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Saved Passenger Profiles</h3>
                <p className="text-xs text-gray-500">
                  Save frequent family and travel companions for instant autofill during bus bookings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddTravellerOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Traveller</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTravellers.map((traveller) => (
                <div
                  key={traveller.id}
                  className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7E22CE] flex items-center justify-center font-bold text-xs uppercase">
                      {traveller.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{traveller.name}</h4>
                      <p className="text-[11px] text-gray-500 capitalize">
                        {traveller.gender} • {traveller.age} years
                      </p>
                      {traveller.phone && (
                        <p className="text-[10px] text-gray-400 mt-0.5">+91 {traveller.phone}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      deleteSavedTraveller(traveller.id);
                      toast.success(`Removed ${traveller.name} from saved travellers.`);
                    }}
                    className="text-gray-400 hover:text-red-500 transition p-1"
                    title="Delete saved traveller"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Travel Journal Full View */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Your Journey Spreads & Photo Memories</h3>
                <p className="text-xs text-gray-500">
                  Double page spreads from your scenic bus voyages across India.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewMemoryOpen(true)}
                className="bg-[#7E22CE] hover:bg-[#6B21A8] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Travel Memory</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spreads.map((spread, idx) => (
                <div
                  key={spread.id || idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-card border border-purple-100 hover:shadow-hover transition duration-300 flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={spread.image}
                      alt={spread.alt || spread.label}
                      className="w-full h-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      Spread #{idx + 1}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{spread.label}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {spread.notes?.[0]?.body || spread.alt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-purple-700 font-semibold">
                        {spread.prints?.length || 0} Photos • {spread.notes?.length || 0} Notes
                      </span>
                      <button
                        type="button"
                        onClick={() => handleJournalAction('share', idx)}
                        className="text-gray-400 hover:text-purple-600 transition flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-gray-900">Edit Passenger Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Traveller Modal */}
      {addTravellerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-gray-900">Add Frequent Traveller</h3>
            <form onSubmit={handleAddTravellerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sen"
                  value={newTraveller.name}
                  onChange={(e) => setNewTraveller({ ...newTraveller, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="28"
                    value={newTraveller.age}
                    onChange={(e) => setNewTraveller({ ...newTraveller, age: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={newTraveller.gender}
                    onChange={(e) => setNewTraveller({ ...newTraveller, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={newTraveller.phone}
                  onChange={(e) => setNewTraveller({ ...newTraveller, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddTravellerOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl"
                >
                  Add Traveller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {newMemoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-extrabold text-gray-900">Add New Journey Memory</h3>
            </div>
            <p className="text-xs text-gray-500">
              Pin your personal bus adventure, scenic viewpoint, and dhaba chai memories into your 3D journal.
            </p>
            <form onSubmit={handleAddMemorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning fog at Solang Nullah"
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Destination / Route
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi to Manali Overnight Express"
                  value={newMemoryLocation}
                  onChange={(e) => setNewMemoryLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Story / Note
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your impressions, highway moments, music playlist, or food discoveries..."
                  value={newMemoryStory}
                  onChange={(e) => setNewMemoryStory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMemoryOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl"
                >
                  Save to Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
