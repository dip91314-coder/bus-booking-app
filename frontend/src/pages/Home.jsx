import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BusSearchForm from '../components/bus/BusSearchForm';
import LeafletMap from '../components/common/LeafletMap';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Chip from '../components/common/Chip';
import {
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Star,
  Copy,
  Check,
  Quote,
  Play,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Count-up component for animated numbers
const CountUp = ({ to = 100, duration = 1.2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(to, 10);
    if (isNaN(end)) return;
    const incrementTime = (duration * 1000) / end;
    const timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [to, duration]);

  return <span>{count}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Konkan');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [mapOrigin, setMapOrigin] = useState('Mumbai');
  const [mapDest, setMapDest] = useState('Pune');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState('');
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const videoRef = React.useRef(null);

  const handleSelectCityFromMap = (cityName, type) => {
    if (type === 'origin') setMapOrigin(cityName);
    if (type === 'destination') setMapDest(cityName);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to YatraBus updates!');
    setNewsletterEmail('');
  };

  // Best offers for you matching reference design
  const OFFERS = [
    {
      title: 'GET 15% off',
      route: 'Indore to Pune',
      code: 'PURPLE15',
      badge: 'Use Code : PURPLE15',
      tag: 'EXPRESS ROUTE',
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-[#1746C8] via-[#1E1B4B] to-[#2A0845]'
    },
    {
      title: 'Flat 20% Off',
      route: 'Ayodhya to Nagpur',
      code: 'AYODHYA20',
      badge: 'Use code : AYODHYA20',
      tag: 'PILGRIM SPECIAL',
      img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-[#854D0E] via-[#3B0764] to-[#2A0845]'
    },
    {
      title: 'Get 100RS off',
      route: 'On every Return Trip',
      code: 'RETURN100',
      badge: 'BOOK NOW',
      tag: 'ROUND TRIP',
      img: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-[#4C1D95] via-[#2E1065] to-[#1A0426]'
    }
  ];

  const TRIP_TABS = ['Pilgrim', 'Konkan', 'Leisure', 'Monsoon'];

  const SHORT_TRIPS = {
    Konkan: [
      {
        id: 'k1',
        title: 'Mahabaleshwar - Ganpatipule',
        duration: '3D/2N',
        type: 'Coastal Route',
        fare: '4,550',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Mahabaleshwar ➔ Ganpatipule'
      },
      {
        id: 'k2',
        title: 'Harihareshwar - Diveagar',
        duration: '2D/1N',
        type: 'Beach Circuit',
        fare: '4,550',
        image: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Diveagar'
      },
      {
        id: 'k3',
        title: 'Dapoli - Murud - Harnai',
        duration: '4D/3N',
        type: 'Heritage Shore',
        fare: '7,550',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Dapoli'
      },
      {
        id: 'k4',
        title: 'Chiplun - River Safari',
        duration: '2D/1N',
        type: 'Backwaters',
        fare: '4,550',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Chiplun'
      }
    ],
    Pilgrim: [
      {
        id: 'p1',
        title: 'Shirdi - Shani Shingnapur',
        duration: '2D/1N',
        type: 'Divine Darshan',
        fare: '3,200',
        image: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Shirdi'
      },
      {
        id: 'p2',
        title: 'Trimbakeshwar - Nashik',
        duration: '2D/1N',
        type: 'Jyotirlinga Tour',
        fare: '2,800',
        image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Nashik'
      },
      {
        id: 'p3',
        title: 'Kolhapur Mahalaxmi',
        duration: '2D/1N',
        type: 'Temple Tour',
        fare: '3,500',
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Kolhapur'
      },
      {
        id: 'p4',
        title: 'Pandharpur Vithoba',
        duration: '2D/1N',
        type: 'Holy Pilgrimage',
        fare: '2,900',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
        route: 'Solapur ➔ Pandharpur'
      }
    ],
    Leisure: [
      {
        id: 'l1',
        title: 'Lonavala & Khandala Escapes',
        duration: '1D/1N',
        type: 'Hill Retreat',
        fare: '1,800',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Lonavala'
      },
      {
        id: 'l2',
        title: 'Goa Coastal Cruiser',
        duration: '4D/3N',
        type: 'Beach Vacation',
        fare: '6,800',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Panaji'
      },
      {
        id: 'l3',
        title: 'Alibaug Sunset Getaway',
        duration: '2D/1N',
        type: 'Island Break',
        fare: '2,600',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Alibaug'
      },
      {
        id: 'l4',
        title: 'Matheran Eco Forest',
        duration: '2D/1N',
        type: 'Nature Trail',
        fare: '2,200',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Neral'
      }
    ],
    Monsoon: [
      {
        id: 'm1',
        title: 'Malshej Ghat Waterfalls',
        duration: '1D/0N',
        type: 'Misty Pass',
        fare: '1,650',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        route: 'Thane ➔ Malshej'
      },
      {
        id: 'm2',
        title: 'Tamhini Ghat Valley Walk',
        duration: '1D/0N',
        type: 'Waterfall Trek',
        fare: '1,500',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Tamhini'
      },
      {
        id: 'm3',
        title: 'Bhandardara Lake & Wilson Dam',
        duration: '2D/1N',
        type: 'Lake Camping',
        fare: '3,100',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Igatpuri'
      },
      {
        id: 'm4',
        title: 'Amboli Ghat Mist Tour',
        duration: '3D/2N',
        type: 'Rainforest Route',
        fare: '5,400',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80',
        route: 'Kolhapur ➔ Amboli'
      }
    ]
  };

  const currentTrips = SHORT_TRIPS[activeTab] || SHORT_TRIPS.Konkan;

  const PURPLE_TESTIMONIALS = [
    {
      name: 'Vikas Morvadiya',
      location: 'Rajkot',
      role: 'Regular Traveler',
      quote:
        'I travel a lot for work from Pune to Nagpur on Purple buses and have traveled by almost all bus services. Since my first ride with the Purple Bus, I have been their regular customer. The reason is their luxurious buses and their hospitable crew.'
    },
    {
      name: 'Sunita Deshmukh',
      location: 'Pune',
      role: 'Family Vacationer',
      quote:
        'Booking through PURPLE is effortless and clean. The buses are always on time, spotlessly clean, and provide comfortable sleeper berths for overnight travel across Maharashtra.'
    },
    {
      name: 'Anand Kulkarni',
      location: 'Indore',
      role: 'Business Commuter',
      quote:
        'Excellent live bus tracking, polite drivers, and genuine cashback directly to my Purple Wallet. Very pleased with the premium service quality!'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors">
      {/* 1. HERO + SEARCH SECTION WITH CINEMATIC VIDEO BACKGROUND */}
      <section className="relative pt-10 pb-20 overflow-hidden min-h-[480px] flex items-center">
        {/* Full Video Background with Poster Fallback */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            src="/hero-video.mp4"
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
            poster="/hero-bus.jpg"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          {/* Deep Dark Overlay for crisp contrast matching design */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070D1F]/90 via-[#0B132B]/80 to-[#1C0F38]/85 backdrop-blur-[0.5px]"></div>
          {/* Bottom gentle fade into page surface */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white dark:from-[#0B0F19] to-transparent"></div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10 w-full">
          {/* Badge & Title */}
          <div className="mb-6 text-center sm:text-left max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-3">
              <div className="inline-flex items-center gap-2 bg-[#F59E0B] text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> India's Trusted Bus Transit Platform
              </div>
              <button
                type="button"
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className="inline-flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 transition cursor-pointer"
                title={isVideoMuted ? 'Turn on video audio' : 'Mute video audio'}
              >
                {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isVideoMuted ? 'Sound Off' : 'Sound On'}</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md text-[11px] font-bold px-3 py-1 rounded-full border border-white/25 transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white text-white" />
                <span>Watch Story Video</span>
              </button>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
              Book Bus Tickets
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 font-normal">
              Find luxury sleepers, express coaches, and intercity transit tickets at guaranteed best prices across India.
            </p>
          </div>

          {/* Search Card Container */}
          <div className="relative z-20">
            <BusSearchForm />
          </div>
        </div>
      </section>

      {/* Full Video Modal */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative bg-slate-950 rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60 text-white">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-bold">YatraBus Journey Experience Video</h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                src="/hero-video.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. BEST OFFERS FOR YOU */}
      <section className="py-14 bg-white dark:bg-[#0E1526] border-b border-[#E5E7EB] dark:border-slate-800 transition-colors">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#3B0764] dark:text-purple-300 tracking-tight">
                Best offers for you
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                Exclusive promo discounts and instant fare savings on trending routes
              </p>
            </div>
            <Link
              to="/routes"
              className="text-xs sm:text-sm font-bold text-[#7E22CE] dark:text-purple-400 hover:text-[#5B21B6] dark:hover:text-purple-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View all offers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS.map((offer, idx) => (
              <div
                key={idx}
                className="group relative rounded-[20px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900/40 cursor-pointer flex flex-col justify-between h-44"
              >
                {/* Background Image */}
                <img
                  src={offer.img}
                  alt={offer.route}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Vibrant Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${offer.bgGradient} opacity-90 group-hover:opacity-95 transition-opacity`}></div>

                {/* Content Overlay matching reference exactly */}
                <div className="relative z-10 p-5 flex flex-col justify-between h-full text-white">
                  <div>
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full mb-2 border border-white/20">
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
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1E1B4B]/80 hover:bg-[#1E1B4B] border border-white/20 px-3.5 py-1.5 rounded-[10px] text-white transition active:scale-95 shadow-sm"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-300" />
                      <span>{offer.badge}</span>
                      {copiedCode === offer.code && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 4. SHORT TRIPS */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="py-16 bg-white dark:bg-[#0B0F19] border-b border-[#E2E8F0] dark:border-slate-800 transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-[28px] font-semibold text-[#0F172A] dark:text-white tracking-tight">
                Explore Short Trips & Weekend Circuits
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                Handpicked weekend getaways, coastal corridors, and pilgrim tours with guaranteed seats.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2" role="tablist">
              {TRIP_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 select-none ${
                    activeTab === tab
                      ? 'bg-[#5B21B6] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
              >
                <div>
                  {/* Fixed 16:10 Aspect Ratio with Lazy Loading and Zoom Container */}
                  <div className="relative aspect-[16/10] w-full bg-[#F1F5F9] dark:bg-slate-800 overflow-hidden rounded-t-md">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-[#0F172A]/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-sm">
                      {trip.duration}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-white/95 text-[#0F172A] text-xs font-semibold px-2 py-0.5 rounded-sm shadow-sm">
                      {trip.type}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-white line-clamp-1 group-hover:text-[#5B21B6] dark:group-hover:text-purple-400 transition-colors">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#5B21B6] dark:text-purple-400 shrink-0" />
                      <span className="truncate">{trip.route}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-[#F1F5F9] dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#64748B] dark:text-slate-400 block font-medium">Starting from</span>
                    <span className="text-base font-bold text-[#5B21B6] dark:text-purple-400">₹{trip.fare}</span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(`/buses?destination=${encodeURIComponent(trip.title.split(' ')[0])}`)
                    }
                    className="min-h-[38px] px-3.5 py-1.5 text-xs rounded-sm hover:-translate-y-0.5 active:scale-95"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 5. ROUTE NAVIGATOR MAP */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="py-16 bg-white dark:bg-[#0E1526] border-b border-[#E5E7EB] dark:border-slate-800 transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-[28px] font-semibold text-[#0F172A] dark:text-white tracking-tight">
                National Highway Route Navigator
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                Explore major highway transit corridors and bus terminus connections.
              </p>
            </div>
          </div>

          <LeafletMap
            originCity={mapOrigin}
            destinationCity={mapDest}
            onCitySelect={handleSelectCityFromMap}
            height="420px"
          />
        </div>
      </motion.section>

      {/* 6. CUSTOMER TESTIMONIALS */}
      <section className="py-16 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#3B0764] dark:text-purple-300 tracking-tight">
            Customer Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            From the first stop to the final destination, YatraBus journey is more than just a ride.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] rounded-3xl p-8 sm:p-12 border border-purple-100 dark:border-slate-800 shadow-xl shadow-purple-950/5 relative transition-colors">
          <div className="absolute top-6 right-8 text-purple-200 dark:text-purple-900/40">
            <Quote className="w-12 h-12 rotate-180" />
          </div>

          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {PURPLE_TESTIMONIALS[testimonialIdx].name}
            </h3>
            <span className="text-[11px] font-semibold text-[#7E22CE] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-800/50 mt-1.5 inline-block">
              {PURPLE_TESTIMONIALS[testimonialIdx].location} • {PURPLE_TESTIMONIALS[testimonialIdx].role}
            </span>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-5 italic">
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
                aria-label="Previous testimonial"
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#7E22CE] dark:hover:border-purple-400 text-slate-600 dark:text-slate-300 flex items-center justify-center transition active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {PURPLE_TESTIMONIALS.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      i === testimonialIdx ? 'w-5 bg-[#3B0764] dark:bg-purple-400' : 'w-1.5 bg-purple-200 dark:bg-slate-700'
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
                aria-label="Next testimonial"
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#7E22CE] dark:hover:border-purple-400 text-slate-600 dark:text-slate-300 flex items-center justify-center transition active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. READY TO GET OUR LATEST NEWSLETTER? */}
      <section className="py-16 bg-gradient-to-b from-[#FAF5FF] dark:from-[#0E1526] via-[#FAF5FF]/60 dark:via-[#0E1526]/80 to-[#F3E8FF]/60 dark:to-[#0B0F19] border-t border-purple-100 dark:border-slate-800 transition-colors">
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-[#3B0764] dark:text-white tracking-tight">
            Ready to Get our <span className="underline decoration-amber-400 decoration-wavy decoration-2">latest newsletter?</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-2">
            Sign up to receive route announcements, weekend holiday discount coupons, and express schedules.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-[#111622] text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E22CE] shadow-sm"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition whitespace-nowrap active:scale-95 cursor-pointer"
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
