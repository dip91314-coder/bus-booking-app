import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import SeatLayout from '../components/bus/SeatLayout';
import FareSummaryCard from '../components/booking/FareSummaryCard';
import {
  Bus,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    buses,
    selectedBus,
    setSelectedBus,
    selectedSeats,
    selectedBoardingPoint,
    setSelectedBoardingPoint,
    selectedDroppingPoint,
    setSelectedDroppingPoint
  } = useBooking();

  // Find bus if not currently set or if navigated directly
  const bus = selectedBus || buses.find((b) => b.id === id) || buses[0];

  useEffect(() => {
    if (bus && (!selectedBus || selectedBus.id !== bus.id)) {
      setSelectedBus(bus);
    }
    // Set default boarding & dropping if not chosen
    if (bus && !selectedBoardingPoint && bus.boardingPoints?.length > 0) {
      setSelectedBoardingPoint(bus.boardingPoints[0]);
    }
    if (bus && !selectedDroppingPoint && bus.droppingPoints?.length > 0) {
      setSelectedDroppingPoint(bus.droppingPoints[0]);
    }
  }, [bus, selectedBus]);

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-base font-bold text-gray-800">Bus not found.</p>
          <button
            onClick={() => navigate('/buses')}
            className="mt-3 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Back to Bus Search
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least 1 seat to continue.');
      return;
    }
    if (!selectedBoardingPoint) {
      toast.error('Please choose a boarding point.');
      return;
    }
    if (!selectedDroppingPoint) {
      toast.error('Please choose a dropping point.');
      return;
    }

    navigate('/booking/passengers');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      {/* Bus Header Ribbon */}
      <div className="bg-[#071A4D] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{bus.operator}</h1>
                <span className="text-xs bg-blue-800/80 text-blue-200 px-2.5 py-0.5 rounded-full font-semibold border border-blue-700">
                  {bus.busType}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {bus.origin} ➔ {bus.destination} • Departure: <strong>{bus.departureTime}</strong> • {bus.busNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-blue-200">
            <div className="flex items-center gap-1.5 bg-blue-900/60 px-3 py-1.5 rounded-xl border border-blue-800">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{bus.rating}</span>
              <span>({bus.reviewsCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-900/40 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-700/50">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Safe Verified Coach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Seat Map & Boarding / Dropping Pickers */}
          <div className="lg:col-span-8 space-y-8">
            {/* Interactive Seat Map */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-extrabold text-gray-900">
                  Select Your Seats (Max 6 Seats)
                </h2>
                <span className="text-xs text-gray-400">
                  Click on an available seat to pick or release
                </span>
              </div>
              <SeatLayout bus={bus} />
            </div>

            {/* Boarding Point Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Select Boarding Point in {bus.origin}
              </h3>
              <div className="space-y-2">
                {bus.boardingPoints?.map((bp) => {
                  const isSelected = selectedBoardingPoint?.id === bp.id;
                  return (
                    <div
                      key={bp.id}
                      onClick={() => setSelectedBoardingPoint(bp)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                            isSelected ? 'border-primary' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900">{bp.name}</p>
                          <p className="text-[11px] text-gray-500">{bp.landmark}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary font-mono">{bp.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dropping Point Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                Select Dropping Point in {bus.destination}
              </h3>
              <div className="space-y-2">
                {bus.droppingPoints?.map((dp) => {
                  const isSelected = selectedDroppingPoint?.id === dp.id;
                  return (
                    <div
                      key={dp.id}
                      onClick={() => setSelectedDroppingPoint(dp)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                            isSelected ? 'border-accent' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-accent"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900">{dp.name}</p>
                          <p className="text-[11px] text-gray-500">{dp.landmark}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-accent font-mono">{dp.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-4">
            <FareSummaryCard
              onContinue={handleContinue}
              buttonText="Continue to Passenger Details"
              disabled={selectedSeats.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

