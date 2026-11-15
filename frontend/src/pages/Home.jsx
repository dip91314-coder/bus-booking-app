import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BusSearchForm from '../components/bus/BusSearchForm';
import Button from '../components/common/Button';
import {
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Check,
  Quote,
  ShieldCheck,
  Armchair,
  TicketCheck,
  Bus,
  Star,
  Award,
  Clock,
  Milestone,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Smartphone,
  QrCode,
  Headphones,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { offerApi, packageApi } from '../services/api';
import OptimizedImage from '../components/common/OptimizedImage';

const LeafletMap = React.lazy(() => import('../components/common/LeafletMap'));

const Home = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('All circuits');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [mapOrigin, setMapOrigin] = useState('Mumbai');
  const [mapDest, setMapDest] = useState('Pune');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState('');
  const [apiOffers, setApiOffers] = useState([]);
  const [apiPackages, setApiPackages] = useState([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const mapSectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    offerApi.getOffers()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setApiOffers(data);
        }
      })
      .catch(() => {});

    packageApi.getPackages()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setApiPackages(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const section = mapSectionRef.current;
    if (!section) return;

    if (!('IntersectionObserver' in window)) {
      setMapVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
      code: 'YATRA15',
      badge: 'Use Code : YATRA15',
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

  const TRIP_TABS = ['All circuits', 'Pilgrim', 'Konkan', 'Leisure', 'Monsoon'];

  const SHORT_TRIPS = {
    Konkan: [
      {
        id: 'k1',
        title: 'Mahabaleshwar - Ganpatipule Coastal Circuit',
        duration: '3D/2N',
        type: 'Coastal Route',
        fare: '4,550',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Mahabaleshwar ➔ Ganpatipule'
      },
      {
        id: 'k2',
        title: 'Harihareshwar - Diveagar Beach Trail',
        duration: '2D/1N',
        type: 'Beach Circuit',
        fare: '4,250',
        image: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Diveagar ➔ Harihareshwar'
      },
      {
        id: 'k3',
        title: 'Dapoli - Murud - Harnai Sea Forts',
        duration: '4D/3N',
        type: 'Heritage Shore',
        fare: '7,550',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Dapoli ➔ Murud'
      },
      {
        id: 'k4',
        title: 'Chiplun Backwaters River Safari',
        duration: '2D/1N',
        type: 'Backwaters',
        fare: '4,550',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Chiplun ➔ Guhagar'
      },
      {
        id: 'k5',
        title: 'Alibaug - Kihim Coastal Forts',
        duration: '2D/1N',
        type: 'Island Getaway',
        fare: '3,200',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Alibaug ➔ Kihim'
      },
      {
        id: 'k6',
        title: 'Tarkarli - Malvan Coral Beach Safari',
        duration: '3D/2N',
        type: 'Scuba & Coast',
        fare: '5,900',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Malvan ➔ Tarkarli'
      }
    ],
    Pilgrim: [
      {
        id: 'p1',
        title: 'Shirdi Sai - Shani Shingnapur Darshan',
        duration: '2D/1N',
        type: 'Divine Darshan',
        fare: '3,200',
        image: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Shirdi ➔ Shani Shingnapur'
      },
      {
        id: 'p2',
        title: 'Trimbakeshwar - Nashik Panchavati',
        duration: '2D/1N',
        type: 'Jyotirlinga Tour',
        fare: '2,800',
        image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Nashik ➔ Trimbakeshwar'
      },
      {
        id: 'p3',
        title: 'Kolhapur Mahalaxmi & Jyotiba Hill',
        duration: '2D/1N',
        type: 'Shaktipeeth Circuit',
        fare: '3,500',
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Kolhapur ➔ Jyotiba'
      },
      {
        id: 'p4',
        title: 'Pandharpur Vithoba & Alandi Wari',
        duration: '2D/1N',
        type: 'Holy Pilgrimage',
        fare: '2,900',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
        route: 'Solapur ➔ Pandharpur ➔ Alandi'
      },
      {
        id: 'p5',
        title: 'Rishikesh - Haridwar Holy Ganga Aarti',
        duration: '3D/2N',
        type: 'Spiritual River Tour',
        fare: '3,900',
        image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80',
        route: 'Delhi ➔ Haridwar ➔ Rishikesh'
      },
      {
        id: 'p6',
        title: 'Tirupati Balaji Express Darshan',
        duration: '2D/1N',
        type: 'Temple Darshan',
        fare: '4,200',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
        route: 'Bengaluru ➔ Tirupati'
      }
    ],
    Leisure: [
      {
        id: 'l1',
        title: 'Lonavala & Khandala Western Escapes',
        duration: '1D/1N',
        type: 'Hill Retreat',
        fare: '1,800',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Lonavala ➔ Khandala'
      },
      {
        id: 'l2',
        title: 'Goa Coastal Cruiser & Sun Cruise',
        duration: '4D/3N',
        type: 'Beach Vacation',
        fare: '6,800',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Panaji ➔ Calangute'
      },
      {
        id: 'l3',
        title: 'Alibaug Sunset Getaway & Water Sports',
        duration: '2D/1N',
        type: 'Island Break',
        fare: '2,600',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Alibaug ➔ Mandwa'
      },
      {
        id: 'l4',
        title: 'Matheran Eco Forest & Panorama Point',
        duration: '2D/1N',
        type: 'Nature Trail',
        fare: '2,200',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Neral ➔ Matheran'
      },
      {
        id: 'l5',
        title: 'Coorg Coffee Mist & Abbey Falls',
        duration: '3D/2N',
        type: 'Plantation Stay',
        fare: '5,600',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80',
        route: 'Bengaluru ➔ Madikeri ➔ Coorg'
      },
      {
        id: 'l6',
        title: 'Udaipur Royal Lakes & City Palace',
        duration: '3D/2N',
        type: 'Palace Heritage',
        fare: '5,950',
        image: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=800&auto=format&fit=crop&q=80',
        route: 'Jaipur ➔ Ajmer ➔ Udaipur'
      }
    ],
    Monsoon: [
      {
        id: 'm1',
        title: 'Malshej Ghat Misty Waterfalls Circuit',
        duration: '1D/0N',
        type: 'Misty Pass',
        fare: '1,650',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        route: 'Thane ➔ Malshej ➔ Shivneri'
      },
      {
        id: 'm2',
        title: 'Tamhini Ghat Deep Valley Waterfall Walk',
        duration: '1D/0N',
        type: 'Waterfall Trek',
        fare: '1,500',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Mulshi ➔ Tamhini'
      },
      {
        id: 'm3',
        title: 'Bhandardara Lake & Wilson Dam Cascades',
        duration: '2D/1N',
        type: 'Lake Camping',
        fare: '3,100',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
        route: 'Mumbai ➔ Igatpuri ➔ Bhandardara'
      },
      {
        id: 'm4',
        title: 'Amboli Ghat Mist Tour & Forest Springs',
        duration: '3D/2N',
        type: 'Rainforest Route',
        fare: '5,400',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80',
        route: 'Kolhapur ➔ Sawantwadi ➔ Amboli'
      },
      {
        id: 'm5',
        title: 'Mahabaleshwar Lingmala Cascades',
        duration: '2D/1N',
        type: 'Valley Views',
        fare: '3,450',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
        route: 'Pune ➔ Wai ➔ Mahabaleshwar'
      },
      {
        id: 'm6',
        title: 'Wayanad Chembra Mist Peak & Lake',
        duration: '3D/2N',
        type: 'Western Ghats',
        fare: '5,800',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
        route: 'Kozhikode ➔ Vythiri ➔ Wayanad'
      }
    ]
  };

  const currentTrips = React.useMemo(() => {
    if (activeTab === 'All circuits') {
      if (apiPackages.length > 0) {
        return apiPackages.map((p) => ({
          id: p._id || p.slug,
          title: p.title,
          duration: `${p.durationDays}D/${p.durationNights}N`,
          type: p.packageType || 'Scenic Circuit',
          fare: p.pricePerPerson.toLocaleString('en-IN'),
          image: p.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
          route: p.routeDescription || `${p.departureCity} ➔ ${p.destinationCity}`
        }));
      }
      return Object.values(SHORT_TRIPS).flat();
    }
    if (apiPackages.length > 0) {
      const filtered = apiPackages.filter((p) => p.category === activeTab);
      if (filtered.length > 0) {
        return filtered.map((p) => ({
          id: p._id || p.slug,
          title: p.title,
          duration: `${p.durationDays}D/${p.durationNights}N`,
          type: p.packageType || 'Scenic Circuit',
          fare: p.pricePerPerson.toLocaleString('en-IN'),
          image: p.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
          route: p.routeDescription || `${p.departureCity} ➔ ${p.destinationCity}`
        }));
      }
    }
    return SHORT_TRIPS[activeTab] || [];
  }, [apiPackages, activeTab]);

  const PURPLE_TESTIMONIALS = [
    {
      name: 'Rohan Deshmukh',
      location: 'Pune',
      role: 'Regular Traveler',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      route: 'Mumbai ➔ Pune (Shivneri AC)',
      rating: 5,
      quote:
        'Booking through YatraBus is seamless! Clean AC sleeper coach, courteous driver, on-time boarding, and real-time seat lock made my travel completely stress-free.'
    },
    {
      name: 'Pooja Bhattacharya',
      location: 'Kolkata',
      role: 'Family Holiday',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      route: 'Kolkata ➔ Siliguri (Volvo Multi-Axle)',
      rating: 5,
      quote:
        'The overnight Volvo sleeper to Siliguri was super comfortable. The linen was fresh, charging ports worked, and the instant PDF ticket with QR code made boarding hassle-free!'
    },
    {
      name: 'Anand Kulkarni',
      location: 'Indore',
      role: 'Business Commuter',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      route: 'Delhi ➔ Jaipur (Royal Express)',
      rating: 5,
      quote:
        'Excellent live bus tracking, polite drivers, and genuine cashback directly to my YatraBus Wallet. Very pleased with the premium service quality!'
    }
  ];

  const POPULAR_CORRIDORS = [
    {
      origin: 'Kolkata',
      destination: 'Siliguri',
      duration: '10h 30m',
      distance: '580 km',
      fare: '890',
      type: 'Multi-Axle AC Sleeper (2+1)',
      services: '12 daily departures',
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
    },
    {
      origin: 'Mumbai',
      destination: 'Pune',
      duration: '3h 30m',
      distance: '150 km',
      fare: '400',
      type: 'Express AC Seater (2+2)',
      services: '24 daily departures',
      img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80'
    },
    {
      origin: 'Delhi',
      destination: 'Jaipur',
      duration: '5h 15m',
      distance: '280 km',
      fare: '550',
      type: 'Premium AC Sleeper (2+1)',
      services: '18 daily departures',
      img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80'
    },
    {
      origin: 'Bengaluru',
      destination: 'Chennai',
      duration: '6h 30m',
      distance: '345 km',
      fare: '750',
      type: 'Diamond AC Sleeper (2+1)',
      services: '14 daily departures',
      img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80'
    },
    {
      origin: 'Delhi',
      destination: 'Manali',
      duration: '14h 00m',
      distance: '535 km',
      fare: '1,350',
      type: 'Volvo 9600 Multi-Axle',
      services: '8 daily departures',
      img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80'
    },
    {
      origin: 'Kolkata',
      destination: 'Digha',
      duration: '4h 15m',
      distance: '185 km',
      fare: '350',
      type: 'Coastal AC Seater (2+2)',
      services: '16 daily departures',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const TRENDING_DESTINATIONS = [
    {
      name: 'Digha',
      state: 'West Bengal',
      tag: 'Beach Escape',
      fare: '₹350',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      desc: 'Bengal’s favorite seaside getaway with wide beaches & fresh coastal breezes.'
    },
    {
      name: 'Darjeeling',
      state: 'West Bengal',
      tag: 'Hill Station',
      fare: '₹650',
      img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      desc: 'Queen of the Hills featuring tea gardens and panoramic Kanchenjunga sunrises.'
    },
    {
      name: 'Puri',
      state: 'Odisha',
      tag: 'Spiritual Haven',
      fare: '₹580',
      img: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      desc: 'Sacred coastal abode of Lord Jagannath, golden sands, and marine corridors.'
    },
    {
      name: 'Jaipur',
      state: 'Rajasthan',
      tag: 'Royal Heritage',
      fare: '₹490',
      img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      desc: 'The historic Pink City with grand palaces, Amer Fort, and vibrant bazaars.'
    },
    {
      name: 'Manali',
      state: 'Himachal Pradesh',
      tag: 'Snow Peaks',
      fare: '₹899',
      img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      desc: 'Himalayan mountain paradise surrounded by pine forests and glacial passes.'
    },
    {
      name: 'Goa',
      state: 'Goa',
      tag: 'Sun & Sand',
      fare: '₹750',
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      desc: 'Vibrant Konkan coastal escape with palm-lined shores, nightlife, and heritage.'
    }
  ];

  const FLEET_CLASSES = [
    {
      title: 'Volvo 9600 Luxury Sleeper',
      deck: 'Multi-Axle (2+1)',
      features: ['Air Suspension', 'Personal USB-C Port', 'Clean Sanitized Linens', 'Emergency Alert'],
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      tag: 'FLAGSHIP CLASS'
    },
    {
      title: 'BharatBenz Executive Seater',
      deck: 'Pushback (2+2)',
      features: ['Deep Recline Angle', 'Generous Legroom', 'Overhead Luggage Rack', 'Chilled AC'],
      img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
      tag: 'BUSINESS COMMUTE'
    },
    {
      title: 'Scania High-Deck Cruiser',
      deck: 'Dual-Zone AC (2+1)',
      features: ['Panoramic Windows', 'Movie Entertainment', 'Reading Lamp', 'Water Bottle'],
      img: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?auto=format&fit=crop&w=600&q=80',
      tag: 'LONG DISTANCE'
    },
    {
      title: 'GreenTransit Eco Electric',
      deck: '100% Zero-Emission (2+2)',
      features: ['Ultra-Quiet Cabin', 'Regenerative Braking', 'Modern Fast Charging', 'Eco-Certified'],
      img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      tag: 'CLEAN ENERGY'
    }
  ];

  const FAQS = [
    {
      q: 'How does real-time seat locking work on YatraBus?',
      a: 'When you select seats, they are instantly locked in MongoDB for 8 minutes exclusively for your session. During this window, no other user in the world can reserve those seats, giving you ample time to enter passenger details and complete checkout.'
    },
    {
      q: 'What is the ticket cancellation and refund policy?',
      a: 'You can cancel confirmed bookings directly from your Dashboard up to 12 hours before departure for an 85% instant refund credited to your YatraBus Wallet or bank account.'
    },
    {
      q: 'How do I download my digital PDF ticket?',
      a: 'Immediately after successful payment, a digital ticket with verified QR code is generated. You can click "Download PDF" on the confirmation screen or access it anytime under "My Bookings" in your dashboard.'
    },
    {
      q: 'Can I choose my exact physical seat before paying?',
      a: 'Yes! YatraBus provides interactive lower and upper deck seat layout maps. You can see window seats, aisle berths, and dedicated ladies-only seats clearly before reserving.'
    },
    {
      q: 'What luggage allowance is permitted on board?',
      a: 'Each passenger is entitled to 1 large luggage bag (up to 20 kg) placed in the secure lower luggage hold, plus 1 personal laptop/handbag inside the coach overhead rack.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors">
      {/* 1. HERO + SEARCH SECTION */}
      <section className="relative overflow-hidden min-h-[600px] sm:min-h-[660px] lg:min-h-[740px] flex flex-col justify-end pt-28 sm:pt-40 lg:pt-48 pb-10 sm:pb-14">
        {/* Background Video & Poster Fallback */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {reduceMotion || videoFailed ? (
            <img
              src="/hero-bus.jpg"
              alt="YatraBus fleet journey"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <video
              src="/hero-video.mp4"
              poster="/hero-bus.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onError={() => setVideoFailed(true)}
              className="w-full h-full object-cover object-center"
            />
          )}
          {/* Subtle vignette gradient keeping video visible while making text and forms crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/20"></div>
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-[#080D1A] to-transparent"></div>
        </div>

        <motion.div
          className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10 w-full"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
        >
          {/* Badge & Title */}
          <div className="mb-6 text-center sm:text-left max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-3">
              <div className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> India's Premier Online Bus Transit Platform
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-[46px] font-black text-white tracking-tight leading-tight drop-shadow-md">
              Book Your Journey With YatraBus
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 font-medium drop-shadow-sm">
              Direct luxury reservations across 100+ cities · Interactive seat maps with 8-min locks · Instant official PDF tickets.
            </p>
          </div>

          {/* Search Card Container */}
          <div className="relative z-20">
            <BusSearchForm />
          </div>

          {/* Quick Popular Corridors Direct Navigation */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-300 font-bold hidden sm:inline">Popular Routes:</span>
            {[
              { origin: 'Kolkata', destination: 'Siliguri', fare: '₹890' },
              { origin: 'Mumbai', destination: 'Pune', fare: '₹400' },
              { origin: 'Delhi', destination: 'Jaipur', fare: '₹550' },
              { origin: 'Bengaluru', destination: 'Chennai', fare: '₹750' },
              { origin: 'Kolkata', destination: 'Digha', fare: '₹350' },
              { origin: 'Delhi', destination: 'Manali', fare: '₹1,350' },
            ].map((route, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  navigate(`/buses?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}&date=${today}`);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-slate-200 hover:text-white backdrop-blur-sm transition-all text-[11px] font-semibold flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>{route.origin} ➔ {route.destination}</span>
                <span className="text-amber-300 font-bold">{route.fare}</span>
              </button>
            ))}
          </div>

          {/* 3 Value Pillars */}
          <div className="mt-5 grid max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Book Direct With YatraBus', detail: 'Zero middleman markups' },
              { icon: Armchair, title: 'Choose Your Exact Seat', detail: 'Live upper & lower layout preview' },
              { icon: TicketCheck, title: 'Official Digital & PDF Ticket', detail: 'Instant QR code on confirmation' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-slate-950/45 px-3 py-2.5 text-white backdrop-blur-md"
                >
                  <Icon className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold">{feature.title}</p>
                    <p className="truncate text-[10px] text-slate-300">{feature.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 2. BEST OFFERS & PROMO COUPONS */}
      <section className="py-12 bg-white dark:bg-[#0E1526] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5" /> Instant Savings
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Special Travel Offers & Coupons
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Apply active coupons during checkout for instant discounts on confirmed bookings
              </p>
            </div>
            <Link
              to="/popular-trips"
              className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View all deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(apiOffers.length > 0 ? apiOffers : OFFERS).slice(0, 3).map((offer, idx) => {
              const offerImg = offer.img || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';
              const offerBgGradient = offer.bgGradient || (idx % 2 === 0 ? 'from-blue-900 via-indigo-950 to-slate-950' : 'from-amber-900 via-purple-950 to-slate-950');
              const offerTag = offer.tag || (offer.discountType === 'percent' ? `${offer.value}% OFF` : `FLAT ₹${offer.value} OFF`);
              const offerRoute = offer.description || (offer.applicableRoutes?.length ? offer.applicableRoutes.join(', ') : (offer.route || 'All Routes'));
              const offerBadge = offer.badge || `Use Code: ${offer.code}`;

              return (
                <article
                  key={offer._id || offer.code || idx}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-44 cursor-pointer"
                >
                  <img
                    src={offerImg}
                    alt={offerRoute}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${offerBgGradient} opacity-90 group-hover:opacity-95 transition-opacity`}></div>

                  <div className="relative z-10 p-5 flex flex-col justify-between h-full text-white">
                    <div>
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full mb-1 border border-white/20">
                        {offerTag}
                      </span>
                      <h3 className="text-xl font-black leading-tight text-white tracking-tight">
                        {offer.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-200 mt-1 line-clamp-1">
                        {offerRoute}
                      </p>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(offer.code);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900/80 hover:bg-slate-900 border border-white/20 px-3.5 py-1.5 rounded-xl text-white transition active:scale-95 shadow-sm"
                      >
                        <Tag className="w-3.5 h-3.5 text-amber-300" />
                        <span>{offerBadge}</span>
                        {copiedCode === offer.code && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. HIGH-DEMAND INTERCITY BUS CORRIDORS */}
      <section className="py-14 bg-slate-50 dark:bg-[#080D1A] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Bus className="w-3.5 h-3.5" /> High-Speed Transit
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Popular Bus Routes Across India
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Guaranteed daily departures, multi-axle luxury fleets, and real-time seat assignments
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/buses')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
            >
              <span>Explore All Bus Corridors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_CORRIDORS.map((corridor, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                      {corridor.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {corridor.services}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {corridor.origin}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {corridor.destination}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {corridor.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Milestone className="w-3.5 h-3.5 text-slate-400" /> {corridor.distance}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fares From</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{corridor.fare}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      navigate(`/buses?origin=${encodeURIComponent(corridor.origin)}&destination=${encodeURIComponent(corridor.destination)}&date=${today}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>Book Seats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRENDING DESTINATIONS SHOWCASE */}
      <section className="py-14 bg-white dark:bg-[#0E1526] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" /> Scenic Indian Getaways
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Trending Travel Destinations
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore popular coastal retreats, hill stations, and heritage centers with direct bus connectivity
              </p>
            </div>

            <Link
              to="/popular-trips"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Explore All Destinations & Preview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRENDING_DESTINATIONS.map((dest, i) => (
              <div
                key={i}
                onClick={() => navigate(`/popular-trips`)}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] flex flex-col justify-between cursor-pointer"
              >
                <div className="relative h-44 overflow-hidden">
                  <OptimizedImage
                    src={dest.img}
                    alt={dest.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full">
                      {dest.tag}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-[#111622]/90 backdrop-blur-md text-slate-900 dark:text-white px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{dest.rating}</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {dest.name}
                    </h3>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">From {dest.fare}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                    {dest.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SHORT TRIPS & WEEKEND CIRCUITS */}
      <section className="py-14 bg-slate-50 dark:bg-[#080D1A] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Curated Circuits
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Weekend Tours & Short Trips
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                All-inclusive bus transit packages with hotel accommodation and breakfast
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2" role="group">
                {TRIP_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02] border border-transparent'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-300 active:scale-95'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <Link
                to="/short-trips"
                className="px-4 py-2 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-800 shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg group"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <OptimizedImage
                      src={trip.image}
                      alt={trip.title}
                      fallbackSrc="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {trip.duration}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-white/95 text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      {trip.type}
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{trip.route}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">From</span>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">₹{trip.fare}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const routeCities = trip.route.split(' ➔ ');
                      const origin = routeCities[0];
                      const destination = routeCities[routeCities.length - 1];
                      navigate(`/buses?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book Circuit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. YATRABUS FLEET & PASSENGER EXPERIENCE SHOWCASE */}
      <section className="py-14 bg-white dark:bg-[#0E1526] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Modern Fleet Standards
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Travel in Luxury, Arrive Refreshed
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Every YatraBus coach is inspected, sanitized, and operated with state-of-the-art telematics and comfort amenities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLEET_CLASSES.map((fleet, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-[#111622] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden">
                  <OptimizedImage
                    src={fleet.img}
                    alt={fleet.title}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                    {fleet.tag}
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {fleet.title}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{fleet.deck}</p>

                    <div className="mt-3 space-y-1.5">
                      {fleet.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => navigate('/buses')}
                      className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                    >
                      View Schedules
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE YATRABUS (TRUST PILLARS) */}
      <section className="py-14 bg-slate-50 dark:bg-[#080D1A] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Why 500,000+ Travelers Choose YatraBus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Engineered for reliability, transparent fares, and absolute passenger peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: 'Sanitized Coaches',
                desc: 'Deep cleaned, fresh linens, and air filtration prior to every departure.'
              },
              {
                icon: MapPin,
                title: 'Live GPS Tracking',
                desc: 'Real-time vehicle tracking links shareable with family members.'
              },
              {
                icon: Clock,
                title: '100% On-Time Guarantee',
                desc: 'Wallet compensation credits if a service faces unnotified delays.'
              },
              {
                icon: Armchair,
                title: 'Visual Seat Lock',
                desc: 'Pick your exact physical seat with an exclusive 8-min checkout window.'
              },
              {
                icon: Headphones,
                title: '24/7 Road Support',
                desc: 'Toll-free emergency helpline and dedicated passenger care officers.'
              }
            ].map((pillar, pIdx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pIdx}
                  className="bg-white dark:bg-[#111622] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col items-center justify-between"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pillar.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. ROUTE NAVIGATOR MAP */}
      <section
        ref={mapSectionRef}
        className="py-14 bg-white dark:bg-[#0E1526] border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Milestone className="w-3.5 h-3.5" /> Highway Network
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                National Transit Corridor Map
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Click origin and destination hubs directly on the map to inspect transit trajectories
              </p>
            </div>
          </div>

          {mapVisible ? (
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 h-[400px]">
                  Loading route navigator map…
                </div>
              }
            >
              <LeafletMap
                originCity={mapOrigin}
                destinationCity={mapDest}
                onCitySelect={handleSelectCityFromMap}
                height="400px"
              />
            </React.Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 h-[400px]">
              <span>Explore corridors on the interactive map.</span>
              <button
                type="button"
                onClick={() => setMapVisible(true)}
                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                Load Interactive Map
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 9. REAL CUSTOMER REVIEWS & STORIES */}
      <section className="py-14 bg-slate-50 dark:bg-[#080D1A] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 Star Rating
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Verified Passenger Experiences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Real journeys, verified PNR bookings, and genuine feedback from every corridor
            </p>
          </div>

          <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl max-w-3xl mx-auto relative">
            <Quote className="absolute top-6 right-8 w-12 h-12 text-slate-200 dark:text-slate-800 rotate-180 pointer-events-none" />

            <div className="flex flex-col items-center">
              <img
                src={PURPLE_TESTIMONIALS[testimonialIdx].avatar}
                alt={PURPLE_TESTIMONIALS[testimonialIdx].name}
                className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover shadow-md mb-3"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {PURPLE_TESTIMONIALS[testimonialIdx].name}
              </h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {PURPLE_TESTIMONIALS[testimonialIdx].location} • {PURPLE_TESTIMONIALS[testimonialIdx].route}
              </p>

              <div className="flex items-center gap-1 my-2">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic max-w-xl mt-2">
                "{PURPLE_TESTIMONIALS[testimonialIdx].quote}"
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setTestimonialIdx((prev) => (prev === 0 ? PURPLE_TESTIMONIALS.length - 1 : prev - 1))}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {PURPLE_TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTestimonialIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === testimonialIdx ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTestimonialIdx((prev) => (prev === PURPLE_TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-14 bg-white dark:bg-[#0E1526] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Everything you need to know about booking, seat locks, and ticket management
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-[#111622] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                  className="w-full p-4 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === fIdx ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === fIdx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. NEWSLETTER SUBSCRIPTION */}
      <section className="py-14 bg-slate-50 dark:bg-[#080D1A] transition-colors">
        <div className="max-w-[640px] mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Stay Updated on Express Corridors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Sign up for weekly flash deals, seasonal vacation discounts, and new route launches.
          </p>

          <form onSubmit={handleSubscribe} className="mt-5 flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111622] text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition whitespace-nowrap active:scale-95 cursor-pointer"
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
