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
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  Wallet,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Konkan');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [mapOrigin, setMapOrigin] = useState('Mumbai');
  const [mapDest, setMapDest] = useState('Pune');
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const handleSelectCityFromMap = (cityName, type) => {
    if (type === 'origin') setMapOrigin(cityName);
    if (type === 'destination') setMapDest(cityName);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to PURPLE updates!');
    setNewsletterEmail('');
  };

  // Best Offers data
  const OFFERS = [
    {
      title: 'GET 15% off',
      route: 'Indore to Pune',
      code: 'PURPLE15',
      badge: 'Use Code : PURPLE15',
      bgGradient: 'from-sky-700 via-indigo-900 to-[#2A0845]',
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
      tag: 'Express Route'
    },
    {
      title: 'Flat 20% Off',
      route: 'Ayodhya to Nagpur',
      code: 'AYODHYA20',
      badge: 'Use code : AYODHYA20',
      bgGradient: 'from-amber-700 via-purple-950 to-[#2A0845]',
      img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
      tag: 'Pilgrim Special'
    },
    {
      title: 'Get 100RS off',
      route: 'On every Return Trip',
      code: 'RETURN100',
      badge: 'BOOK NOW',
      bgGradient: 'from-purple-900 via-indigo-950 to-[#1A0426]',
      img: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=600&auto=format&fit=crop&q=80',
      tag: 'Round Trip'
    }
  ];

  // Short trip tabs & destinations
  const TRIP_TABS = ['Pilgrim', 'Konkan', 'Leisure', 'Monsoon Trip'];

  const SHORT_TRIPS = {
    Konkan: [
      {
        id: 'k1',
        title: 'Mahabaleshwar - Ganpatipule',
        duration: '3D/2N',
        type: 'COASTAL RETREAT',
        fare: 4550,
        image: 'https://images.unsplash.com/photo-1626014303757-646629f635fd?w=600&auto=format&fit=crop&q=80',
        route: 'Pune - Mahabaleshwar - Ganpatipule'
      },
      {
        id: 'k2',
        title: 'Harihareshwar - Diveagar',
        duration: '2D/1N',
        type: 'BEACH CIRCUIT',
        fare: 4550,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        route: 'Mumbai - Diveagar'
      },
      {
        id: 'k3',
        title: 'Dapoli - Murud - Harnai - Kelsi',
        duration: '4D/3N',
        type: 'HERITAGE SHORE',
        fare: 7550,
        image: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=600&auto=format&fit=crop&q=80',
        route: 'Pune - Dapoli'
      },
      {
        id: 'k4',
        title: 'Chiplun - Backwatersafari',
        duration: '2D/1N',
        type: 'RIVER SAFARI',
        fare: 4550,
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&auto=format&fit=crop&q=80',
        route: 'Mumbai - Chiplun'
      }
    ],
    Pilgrim: [
      {
        id: 'p1',
        title: 'Shirdi - Shani Shingnapur',
        duration: '2D/1N',
        type: 'DIVINE DARSHAN',
        fare: 3200,
        image: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=600&auto=format&fit=crop&q=80',
        route: 'Mumbai - Shirdi'
      },
      {
        id: 'p2',
        title: 'Trimbakeshwar - Nashik',
        duration: '2D/1N',
        type: 'JYOTIRLINGA',
        fare: 2800,
        image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600&auto=format&fit=crop&q=80',
        route: 'Pune - Nashik'
      },
      {
        id: 'p3',
        title: 'Kolhapur Mahalaxmi',
        duration: '2D/1N',
        type: 'TEMPLE TOUR',
        fare: 3500,
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?w=600&auto=format&fit=crop&q=80',
        route: 'Pune - Kolhapur'
      },
      {
        id: 'p4',
        title: 'Pandharpur Vithoba',
        duration: '2D/1N',
        type: 'HOLY PILGRIMAGE',
        fare: 2900,
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80',
        route: 'Solapur - Pandharpur'
      }
    ],
    Leisure: [
      {
        id: 'l1',
        title: 'Lonavala & Khandala Escapes',
        duration: '1D/1N',
        type: 'HILL BREEZE',
        fare: 1800,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        route: 'Mumbai - Lonavala'
      },
      {
        id: 'l2',
        title: 'Goa Coastal Cruiser',
        duration: '4D/3N',
        type: 'SUN & SAND',
        fare: 6800,
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
        route: 'Pune - Panaji Goa'
      },
      {
        id: 'l3',
        title: 'Alibaug Sunset Getaway',
        duration: '2D/1N',
        type: 'ISLAND ESCAPE',
        fare: 2600,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        route: 'Mumbai - Alibaug'
      },
      {
        id: 'l4',
        title: 'Matheran Eco Forest',
        duration: '2D/1N',
        type: 'GREEN TRAILS',
        fare: 2200,
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop&q=80',
        route: 'Mumbai - Neral'
      }
    ],
    'Monsoon Trip': [
      {
        id: 'm1',
        title: 'Malshej Ghat Waterfalls',
        duration: '1D/0N',
        type: 'MIST & RAINS',
        fare: 1650,
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        route: 'Thane - Malshej'
      },
      {
        id: 'm2',
        title: 'Tamhini Ghat Valley Walk',
        duration: '1D/0N',
        type: 'MONSOON PASS',
        fare: 1500,
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
        route: 'Pune - Tamhini'
      },
      {
        id: 'm3',
        title: 'Bhandardara Lake & Wilson Dam',
        duration: '2D/1N',
        type: 'CLOUDY PEAKS',
        fare: 3100,
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80',
        route: 'Mumbai - Igatpuri'
      },
      {
        id: 'm4',
        title: 'Amboli Ghat Mist Tour',
        duration: '3D/2N',
        type: 'HIGHLAND RAIN',
        fare: 5400,
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=80',
        route: 'Kolhapur - Amboli'
      }
    ]
  };

  const currentTrips = SHORT_TRIPS[activeTab] || SHORT_TRIPS['Konkan'];

  const PURPLE_TESTIMONIALS = [
    {
      name: 'Vikas Morvadiya',
      location: 'Rajkot',
      quote:
        'I travel a lot for work from Pune to Nagpur on Purple buses and have traveled by almost all bus services. Since my first ride with the Purple Bus, I have been their regular customer. The reason is their luxurious buses and their hospitable crew.',
      role: 'Regular Traveler'
    },
    {
      name: 'Sunita Deshmukh',
      location: 'Pune',
      quote:
        'Booking through PURPLE is effortless and clean. The buses are always on time, spotlessly clean, and provide comfortable sleeper berths for overnight travel across Maharashtra.',
      role: 'Family Vacationer'
    },
    {
      name: 'Anand Kulkarni',
      location: 'Indore',
      quote:
        'Excellent live bus tracking, polite drivers, and genuine cashback directly to my Purple Wallet. Very pleased with the premium service quality!',
      role: 'Business Commuter'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FD] text-slate-800 font-sans">
      {/* 1. HERO SECTION WITH ILLUSTRATION BACKGROUND */}
      <section className="relative pt-8 pb-20 bg-gradient-to-b from-[#F3E8FF]/60 via-[#FAF5FF]/40 to-white overflow-hidden">
        {/* Soft background decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none -ml-20"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header title */}
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B0764] tracking-tight">
              Book Bus Tickets
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Find luxury sleepers, express coaches, and intercity transit tickets at guaranteed best prices.
            </p>
          </div>

          {/* Search Card */}
          <div className="relative z-20">
            <BusSearchForm />
          </div>

          {/* Panoramic Bus & City Skyline Illustration Banner */}
          <div className="mt-12 relative w-full rounded-2xl overflow-hidden border border-purple-100 bg-gradient-to-b from-sky-50 via-purple-50/50 to-white pt-6 shadow-sm">
            {/* Visual cityscape silhouettes */}
            <div className="flex items-end justify-between px-6 sm:px-16 pt-4 pb-2 border-b-2 border-slate-800/80 relative">
              {/* Left City buildings */}
              <div className="hidden sm:flex items-end gap-1.5 opacity-80">
                <div className="w-14 h-24 bg-gradient-to-t from-rose-200 to-rose-100 rounded-t-sm flex flex-col justify-around p-1">
                  <div className="grid grid-cols-2 gap-0.5"><div className="h-2 bg-white/70"></div><div className="h-2 bg-white/70"></div></div>
                  <div className="grid grid-cols-2 gap-0.5"><div className="h-2 bg-white/70"></div><div className="h-2 bg-white/70"></div></div>
                </div>
                <div className="w-20 h-32 bg-gradient-to-t from-pink-300 via-rose-200 to-amber-100 rounded-t-md flex flex-col items-center justify-around p-1 border-t-2 border-rose-300">
                  <div className="w-4 h-4 rounded-full bg-rose-400/40 mb-1"></div>
                  <div className="grid grid-cols-3 gap-1 w-full px-1">
                    <div className="h-2 bg-white/90"></div><div className="h-2 bg-white/90"></div><div className="h-2 bg-white/90"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 w-full px-1">
                    <div className="h-2 bg-white/90"></div><div className="h-2 bg-white/90"></div><div className="h-2 bg-white/90"></div>
                  </div>
                </div>
                <div className="w-12 h-20 bg-gradient-to-t from-purple-200 to-pink-100 rounded-t-sm"></div>
              </div>

              {/* Blue bus moving left */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#1746C8] text-white px-3 py-1.5 rounded-lg shadow-md border-b-4 border-blue-900">
                  <span className="text-[10px] font-black tracking-widest uppercase">PURPLE EXPRESS</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-300"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-300"></span>
                  </div>
                </div>
              </div>

              {/* Traffic Light pole */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-9 bg-slate-900 rounded-full flex flex-col items-center justify-around py-0.5 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="w-0.5 h-10 bg-slate-800"></div>
              </div>

              {/* Red / Maroon bus right */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#881337] text-white px-4 py-2 rounded-lg shadow-md border-b-4 border-rose-950">
                  <span className="text-[11px] font-black tracking-widest uppercase">PURPLE LUXURY</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                  </div>
                </div>
              </div>

              {/* Travelers walking with luggage */}
              <div className="hidden sm:flex items-center gap-4 text-slate-700">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-[#7E22CE]">Travel Safe</span>
                  <span className="text-[10px] text-slate-400">Verified Routes</span>
                </div>
              </div>
            </div>

            {/* Road bar with dashed markings */}
            <div className="bg-slate-900 h-5 w-full flex items-center justify-around px-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-10 h-1 bg-yellow-400/90 rounded-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BEST OFFERS FOR YOU */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#3B0764] tracking-tight">
              Best offers for you
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exclusive promo discounts and instant fare savings on trending routes
            </p>
          </div>
          <Link
            to="/routes"
            className="text-xs font-bold text-[#7E22CE] hover:text-[#3B0764] flex items-center gap-1 transition"
          >
            <span>View all offers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {OFFERS.map((offer, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100 cursor-pointer flex flex-col justify-between h-44"
            >
              <img
                src={offer.img}
                alt={offer.route}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${offer.bgGradient} opacity-85 group-hover:opacity-90 transition-opacity`}></div>

              {/* Content overlay */}
              <div className="relative z-10 p-5 flex flex-col justify-between h-full text-white">
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full mb-2">
                    {offer.tag}
                  </span>
                  <h3 className="text-2xl font-black leading-tight text-white tracking-tight">
                    {offer.title}
                  </h3>
                  <p className="text-xs font-semibold text-purple-100 mt-1">
                    {offer.route}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#3B0764]/80 group-hover:bg-[#3B0764] border border-white/20 px-3 py-1.5 rounded-lg text-white transition">
                    <Tag className="w-3 h-3 text-amber-400" />
                    {offer.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BOOK ZYAADA GET ZYAADA / PURPLE WALLET (NO APP DOWNLOAD) */}
      <section className="py-14 bg-white border-y border-purple-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: How wallet works */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="text-xs font-extrabold tracking-widest text-[#7E22CE] uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Purple Rewards System
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3B0764] mt-2">
                  Book Zyaada Get Zyaada <br />
                  <span className="text-slate-700 font-bold text-xl">Use Purple Wallet</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enjoy instant cashback, zero-cancellation fee protection, and fast 1-click checkout.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  How wallet is work?
                </p>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-[#7E22CE] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p>Create an account on the Purple portal and get <strong>100RS</strong> in your wallet instantly.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-[#7E22CE] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p>Whenever you book a bus ticket, easily use funds from your Purple wallet for instant discounts.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-[#7E22CE] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p>Book more journeys and earn heavy cashback! Apply <em>'Book Zyaada Get Zyaada'</em> code on checkout.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-[#3B0764] hover:bg-[#4C1D95] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md shadow-purple-950/20 transition group"
                >
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span>Use Purple Wallet</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: 4 Grid Cards mirroring the reference mockup */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {/* Card 1: Instant Welcome Bonus */}
              <div className="bg-[#FAF5FF] p-5 rounded-2xl border border-purple-100 hover:border-purple-200 transition shadow-sm flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-lg bg-white text-[#7E22CE] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Instant Welcome</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">And get 100RS in wallet</p>
                </div>
              </div>

              {/* Card 2: Use Purple Wallet */}
              <div className="bg-white p-5 rounded-2xl border border-purple-100 hover:border-purple-200 transition shadow-sm flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7E22CE] flex items-center justify-center shadow-sm">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Use Purple Wallet</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">For Ticket Booking</p>
                </div>
              </div>

              {/* Card 3: Book Zyaada Get Zyaada */}
              <div className="bg-white p-5 rounded-2xl border border-purple-100 hover:border-purple-200 transition shadow-sm flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7E22CE] flex items-center justify-center shadow-sm">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Book Zyaada Get Zyaada</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Get Cashback on Booking</p>
                </div>
              </div>

              {/* Card 4: Purple Wallet brand tile */}
              <div className="bg-gradient-to-br from-[#3B0764] to-[#7E22CE] p-5 rounded-2xl text-white shadow-lg flex flex-col justify-between h-36">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <div className="w-3.5 h-3.5 border-2 border-white rounded-sm"></div>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Purple Wallet</h4>
                  <p className="text-[11px] text-purple-200 mt-0.5">Fast & Secure Payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE YOUR SHORT TRIP */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#3B0764] tracking-tight">
              Explore Your <span className="underline decoration-amber-400 decoration-wavy decoration-2">Short Trip</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handpicked weekend getaways, coastal circuits, and pilgrim darshans with guaranteed bus seats
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-purple-50/80 p-1.5 rounded-xl border border-purple-100">
            {TRIP_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === tab
                    ? 'bg-[#3B0764] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#3B0764] hover:bg-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Short Trip Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {currentTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 w-full overflow-hidden bg-purple-50 relative">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {trip.duration}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                    {trip.type}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#7E22CE] transition line-clamp-1">
                    {trip.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#7E22CE]" />
                    <span>{trip.route}</span>
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-purple-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Starting from</span>
                  <span className="text-sm font-extrabold text-[#3B0764]">₹{trip.fare}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/buses?destination=${encodeURIComponent(trip.title.split(' ')[0])}`)}
                  className="bg-[#3B0764] hover:bg-[#4C1D95] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <span className="w-2 h-2 rounded-full bg-[#3B0764]"></span>
          <span className="w-2 h-2 rounded-full bg-purple-200"></span>
          <span className="w-2 h-2 rounded-full bg-purple-200"></span>
        </div>
      </section>

      {/* 5. INTERACTIVE BUS ROUTE VISUALIZATION MAP */}
      <section className="py-14 bg-white border-y border-purple-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#3B0764] tracking-tight">
                Live Route & Stop Navigator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect national highway transit connectivity, pickup points, and terminal corridors.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Showing: <strong>{mapOrigin}</strong> ➔ <strong>{mapDest}</strong></span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-purple-100 bg-white shadow-sm p-3">
            <LeafletMap
              origin={mapOrigin}
              destination={mapDest}
              onCitySelect={handleSelectCityFromMap}
            />
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIALS */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-[#3B0764] tracking-tight">
            Customer Testimonials
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            From the first stop to the final destination, Purple bus journey was more than just a ride.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-xl shadow-purple-950/5 relative">
          <div className="absolute top-6 right-8 text-purple-200">
            <Quote className="w-12 h-12 rotate-180" />
          </div>

          <div className="max-w-2xl mx-auto">
            <h3 className="text-sm font-extrabold text-slate-900">
              {PURPLE_TESTIMONIALS[testimonialIdx].name}
            </h3>
            <span className="text-[11px] font-semibold text-[#7E22CE] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 mt-1 inline-block">
              {PURPLE_TESTIMONIALS[testimonialIdx].location} • {PURPLE_TESTIMONIALS[testimonialIdx].role}
            </span>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-5 italic">
              "{PURPLE_TESTIMONIALS[testimonialIdx].quote}"
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                type="button"
                onClick={() =>
                  setTestimonialIdx((prev) =>
                    prev === 0 ? PURPLE_TESTIMONIALS.length - 1 : prev - 1
                  )
                }
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#7E22CE] hover:text-[#7E22CE] flex items-center justify-center transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {PURPLE_TESTIMONIALS.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      i === testimonialIdx ? 'w-5 bg-[#3B0764]' : 'w-1.5 bg-purple-200'
                    }`}
                  ></span>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setTestimonialIdx((prev) =>
                    prev === PURPLE_TESTIMONIALS.length - 1 ? 0 : prev + 1
                  )
                }
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#7E22CE] hover:text-[#7E22CE] flex items-center justify-center transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. READY TO GET OUR LATEST NEWSLETTER? */}
      <section className="py-14 bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF]/60 border-t border-purple-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#3B0764]">
            Ready to Get our <span className="underline decoration-amber-400 decoration-wavy decoration-2">latest newsletter?</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign up to receive route announcements, weekend holiday discount coupons, and express schedules.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E22CE] shadow-sm"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition whitespace-nowrap active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
