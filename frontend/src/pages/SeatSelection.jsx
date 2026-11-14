import React, { useEffect } from 'react';
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
  Calendar,
  Printer
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
    setSelectedDroppingPoint,
    searchParams
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
          <p className="text-base font-bold text-slate-800">Bus not found.</p>
          <button
            onClick={() => navigate('/buses')}
            className="mt-3 bg-[#3B0764] text-white text-xs font-bold px-4 py-2 rounded-xl"
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
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* DevIntelle inspired top control header bar */}
      <div className="bg-[#3B0764] text-white py-4 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="YatraBus Logo"
                className="h-7 w-auto object-contain brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>YatraBus</span>
                  <span className="text-purple-300 font-normal text-xs">• Seat Booking</span>
                </h1>
                <p className="text-[11px] text-purple-200">
                  {bus.operator} ({bus.busType})
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 text-purple-100">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Date: <strong>{searchParams.journeyDate || 'Today'}</strong></span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 text-purple-100">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Dept: <strong>{bus.departureTime}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter Bar (Bus Type, Start Point, End Point, Journey Date, Print) */}
      <div className="bg-white border-b border-purple-100 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3 items-center text-xs">
          {/* Bus Type */}
          <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Bus Type</span>
            <span className="font-bold text-slate-800 truncate block">{bus.busType}</span>
          </div>

          {/* Start Point */}
          <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Start Point</span>
            <span className="font-bold text-slate-800 truncate block">{bus.origin}</span>
          </div>

          {/* End Point */}
          <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-100">
            <span className="text-[10px] text-slate-400 block font-semibold">End Point</span>
            <span className="font-bold text-slate-800 truncate block">{bus.destination}</span>
          </div>

          {/* Journey Date */}
          <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Journey Date</span>
            <span className="font-bold text-slate-800 truncate block">
              {searchParams.journeyDate || new Date().toISOString().split('T')[0]}
            </span>
          </div>

          {/* Print/Share */}
          <div className="col-span-2 sm:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-2 bg-[#7E22CE] hover:bg-[#6B21A8] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Seat Layout on Left, Summary Card on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Seat Map & Points Selection */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive Seat Map */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#3B0764]">
                    Select Your Bus Seats
                  </h2>
                  <p className="text-xs text-slate-400">
                    Passengers can book seats in real-time using color codes. Pick up to 6 seats.
                  </p>
                </div>
              </div>
              <SeatLayout bus={bus} />
            </div>

            {/* Boarding Point Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-purple-900/5 border border-purple-100">
              <h3 className="text-xs font-black text-[#3B0764] uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7E22CE]" />
                Select Boarding Point ({bus.origin})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {bus.boardingPoints?.map((bp) => {
                  const isSelected = selectedBoardingPoint?.id === bp.id;
                  return (
                    <div
                      key={bp.id}
                      onClick={() => setSelectedBoardingPoint(bp)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-[#7E22CE] bg-purple-50 ring-1 ring-[#7E22CE]'
                          : 'border-slate-200 hover:border-purple-200 hover:bg-purple-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center ${
                            isSelected ? 'border-[#7E22CE]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{bp.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{bp.landmark}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#7E22CE]">{bp.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dropping Point Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-purple-900/5 border border-purple-100">
              <h3 className="text-xs font-black text-[#3B0764] uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Select Dropping Point ({bus.destination})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {bus.droppingPoints?.map((dp) => {
                  const isSelected = selectedDroppingPoint?.id === dp.id;
                  return (
                    <div
                      key={dp.id}
                      onClick={() => setSelectedDroppingPoint(dp)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-[#7E22CE] bg-purple-50 ring-1 ring-[#7E22CE]'
                          : 'border-slate-200 hover:border-purple-200 hover:bg-purple-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center ${
                            isSelected ? 'border-[#7E22CE]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{dp.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{dp.landmark}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-amber-600">{dp.time}</span>
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
              buttonText="Book Now"
              disabled={selectedSeats.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
