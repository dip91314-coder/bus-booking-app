import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import FareSummaryCard from '../components/booking/FareSummaryCard';
import {
  Users,
  User,
  Mail,
  Phone,
  BookmarkCheck,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const PassengerDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedBus,
    selectedSeats,
    passengers,
    setPassengers,
    savedTravellers,
    addSavedTraveller
  } = useBooking();

  // Contact details
  const [contactEmail, setContactEmail] = useState(user?.email || 'rahul@yatra.com');
  const [contactPhone, setContactPhone] = useState(user?.phone || '9876543210');

  // Passenger state per seat
  const [passengerList, setPassengerList] = useState(() => {
    if (passengers.length === selectedSeats.length && passengers.length > 0) {
      return passengers;
    }
    return selectedSeats.map((seat, idx) => ({
      seatNumber: seat.number,
      name: idx === 0 && user ? user.name : '',
      age: idx === 0 ? '24' : '',
      gender: idx === 0 ? 'male' : 'male',
      saveTraveller: false
    }));
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!selectedBus || selectedSeats.length === 0) {
      navigate('/buses');
    }
  }, [selectedBus, selectedSeats]);

  const handleInputChange = (idx, field, value) => {
    setPassengerList((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleAutofill = (idx, traveller) => {
    setPassengerList((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        name: traveller.name,
        age: traveller.age.toString(),
        gender: traveller.gender
      };
      return updated;
    });
    toast.success(`Autofilled details for ${traveller.name}`);
  };

  const handleProceedToPayment = () => {
    // Validate inputs
    const newErrors = {};

    if (!contactEmail || !contactEmail.includes('@')) {
      newErrors.contactEmail = 'Please provide a valid email address.';
    }
    if (!contactPhone || !/^[0-9]{10}$/.test(contactPhone.trim())) {
      newErrors.contactPhone = 'Please provide a 10-digit mobile number.';
    }

    passengerList.forEach((p, idx) => {
      if (!p.name || p.name.trim().length < 2) {
        newErrors[`p_${idx}_name`] = 'Name must be at least 2 characters.';
      }
      if (!p.age || isNaN(p.age) || Number(p.age) < 1 || Number(p.age) > 120) {
        newErrors[`p_${idx}_age`] = 'Age must be between 1 and 120.';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted form errors before proceeding.');
      return;
    }

    // Save travellers if checkbox checked
    passengerList.forEach((p) => {
      if (p.saveTraveller && p.name) {
        const alreadySaved = savedTravellers.some(
          (st) => st.name.toLowerCase() === p.name.toLowerCase()
        );
        if (!alreadySaved) {
          addSavedTraveller({
            name: p.name,
            age: Number(p.age),
            gender: p.gender,
            phone: contactPhone
          });
        }
      }
    });

    setPassengers(passengerList);
    navigate('/booking/payment');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      {/* Header Ribbon */}
      <div className="bg-[#071A4D] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-blue-900/80 hover:bg-blue-800 flex items-center justify-center text-white transition"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Passenger Details</h1>
              <p className="text-xs text-blue-200 mt-0.5">
                {selectedBus?.operator} • {selectedBus?.origin} ➔ {selectedBus?.destination}
              </p>
            </div>
          </div>
          <div className="text-xs bg-accent/20 text-accent font-bold px-3 py-1 rounded-full border border-accent/30">
            Step 2 of 3: Passenger Information
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Passenger Input Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Contact Details */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Primary Contact Information
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Your ticket PNR and live bus tracking link will be sent to these details.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, contactEmail: null }));
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                        errors.contactEmail ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                      } focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-gray-500 absolute left-3 top-1/2 -translate-y-1/2">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        setErrors((prev) => ({ ...prev, contactPhone: null }));
                      }}
                      className={`w-full pl-12 pr-3 py-2.5 text-xs rounded-xl border ${
                        errors.contactPhone ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                      } focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.contactPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Forms per Selected Seat */}
            {passengerList.map((passenger, idx) => (
              <div
                key={passenger.seatNumber}
                className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <h4 className="font-extrabold text-sm text-gray-900">
                      Passenger {idx + 1}
                    </h4>
                    <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Seat {passenger.seatNumber}
                    </span>
                  </div>

                  {/* Saved Travellers Autofill Helper */}
                  {savedTravellers.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-400 font-medium">Autofill:</span>
                      <select
                        onChange={(e) => {
                          const t = savedTravellers.find((st) => st.id === e.target.value);
                          if (t) handleAutofill(idx, t);
                        }}
                        defaultValue=""
                        className="bg-blue-50 border border-blue-200 text-primary font-bold text-xs rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="" disabled>
                          Select Saved Traveller...
                        </option>
                        {savedTravellers.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.gender}, {st.age})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                  {/* Name */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name (As per Govt. ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sen"
                      value={passenger.name}
                      onChange={(e) => {
                        handleInputChange(idx, 'name', e.target.value);
                        setErrors((prev) => ({ ...prev, [`p_${idx}_name`]: null }));
                      }}
                      className={`w-full px-3 py-2 text-xs rounded-xl border ${
                        errors[`p_${idx}_name`] ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                      } focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                    {errors[`p_${idx}_name`] && (
                      <p className="text-[11px] text-red-500 mt-1">{errors[`p_${idx}_name`]}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      min={1}
                      max={120}
                      value={passenger.age}
                      onChange={(e) => {
                        handleInputChange(idx, 'age', e.target.value);
                        setErrors((prev) => ({ ...prev, [`p_${idx}_age`]: null }));
                      }}
                      className={`w-full px-3 py-2 text-xs rounded-xl border ${
                        errors[`p_${idx}_age`] ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                      } focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                    {errors[`p_${idx}_age`] && (
                      <p className="text-[11px] text-red-500 mt-1">{errors[`p_${idx}_age`]}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handleInputChange(idx, 'gender', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Save passenger checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition font-medium">
                    <input
                      type="checkbox"
                      checked={passenger.saveTraveller || false}
                      onChange={(e) => handleInputChange(idx, 'saveTraveller', e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                    />
                    <span>Save this passenger to my Saved Travellers list for fast future checkouts</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-4">
            <FareSummaryCard
              onContinue={handleProceedToPayment}
              buttonText="Proceed to Payment"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;

