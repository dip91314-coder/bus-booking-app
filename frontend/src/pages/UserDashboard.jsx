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
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Profile Edit modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || 'Rahul Sen');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '9876543210');

  // Add traveller modal
  const [addTravellerOpen, setAddTravellerOpen] = useState(false);
  const [newTraveller, setNewTraveller] = useState({ name: '', age: '', gender: 'male', phone: '' });

  // Filter user bookings
  const upcomingBookings = bookings.filter((b) => b.bookingStatus === 'confirmed');
  const pastBookings = bookings.filter((b) => b.bookingStatus === 'completed');
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'cancelled');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name: profileName, phone: profilePhone });
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
      phone: newTraveller.phone || user?.phone
    });

    setNewTraveller({ name: '', age: '', gender: 'male', phone: '' });
    setAddTravellerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      {/* Dashboard Top Header */}
      <div className="bg-[#071A4D] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-accent shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user?.name || 'Rahul Sen'}</h1>
                <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full border border-accent/30 uppercase">
                  Verified Passenger
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {user?.email} • +91 {user?.phone}
              </p>
              <p className="text-[11px] text-blue-300 mt-1">
                Member since {user?.memberSince || '2025'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="bg-blue-900/80 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-700/60 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-accent" />
              <span>Edit Profile</span>
            </button>
            <Link
              to="/buses"
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Book New Bus</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-gray-200 mb-8">
          {[
            { id: 'bookings', label: 'Upcoming Journeys', count: upcomingBookings.length, icon: <Ticket className="w-4 h-4" /> },
            { id: 'completed', label: 'Past Journeys', count: pastBookings.length, icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: 'cancelled', label: 'Cancelled Bookings', count: cancelledBookings.length, icon: <XCircle className="w-4 h-4" /> },
            { id: 'travellers', label: 'Saved Travellers', count: savedTravellers.length, icon: <BookmarkCheck className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
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
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold text-xs uppercase">
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
                    onClick={() => deleteSavedTraveller(traveller.id)}
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
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate__animated animate__zoomIn">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate__animated animate__zoomIn">
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
    </div>
  );
};

export default UserDashboard;

