import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, ShieldCheck, Mail, Phone, MapPin, Heart, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing! Travel discount coupons will be sent to your inbox.');
    setEmail('');
  };

  return (
    <footer className="bg-[#071A4D] text-white pt-16 pb-12 border-t border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter banner */}
        <div className="bg-gradient-to-r from-primary to-[#0C247A] rounded-2xl p-6 sm:p-10 mb-14 shadow-2xl border border-blue-400/20 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
              Exclusive Member Deals
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Save up to ₹250 on Your Next Intercity Bus Journey
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              Subscribe to the YatraBus newsletter for weekly route discounts, holiday festival passes, and priority seat availability alerts.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="relative flex-1">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              {subscribed ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>

        {/* 4-column link footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-blue-900/40">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-md">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  Yatra<span className="text-accent">Bus</span>
                </span>
                <span className="text-[10px] ml-1.5 bg-accent/20 text-accent font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  India
                </span>
              </div>
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed pr-6">
              Pan-India modern online bus booking platform connecting 250+ Tier-1, Tier-2, and remote pilgrim destinations across India with real-time seat availability, live tracking, and guaranteed digital tickets.
            </p>
            <div className="pt-2 text-xs text-blue-300 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>Transit Headquarters: Connaught Place, New Delhi 110001, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 Helpline: 1800-287-9287 (Toll-Free)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Top Bus Routes */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-accent rounded"></span>
              Top Bus Routes
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-200">
              <li>
                <Link to="/buses?origin=Kolkata&destination=Siliguri" className="hover:text-accent transition">
                  Kolkata to Siliguri Bus
                </Link>
              </li>
              <li>
                <Link to="/buses?origin=Delhi&destination=Jaipur" className="hover:text-accent transition">
                  Delhi to Jaipur Bus
                </Link>
              </li>
              <li>
                <Link to="/buses?origin=Mumbai&destination=Pune" className="hover:text-accent transition">
                  Mumbai to Pune Express
                </Link>
              </li>
              <li>
                <Link to="/buses?origin=Bengaluru&destination=Chennai" className="hover:text-accent transition">
                  Bengaluru to Chennai Bus
                </Link>
              </li>
              <li>
                <Link to="/buses?origin=Delhi&destination=Manali" className="hover:text-accent transition">
                  Delhi to Manali Volvo
                </Link>
              </li>
              <li>
                <Link to="/buses?origin=Kolkata&destination=Varanasi" className="hover:text-accent transition">
                  Kolkata to Varanasi Sleeper
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-primary rounded"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-200">
              <li>
                <Link to="/buses" className="hover:text-white transition">Search All Buses</Link>
              </li>
              <li>
                <Link to="/routes" className="hover:text-white transition">All Interstate Routes</Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition">Featured Destinations</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">Manage My Bookings</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent transition font-semibold">Admin Fleet Portal</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition">Help & FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-400 rounded"></span>
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-200">
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-white transition">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/help#cancellation" className="hover:text-white transition">Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About Our Engineering</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">Grievance Officer</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with academic notice and simulated payment badges */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-300">
          <div className="text-center md:text-left">
            <p>
              &copy; 2026 <strong>YatraBus India</strong>. College Full-Stack Capstone Project.
            </p>
            <p className="text-[11px] text-blue-400 mt-0.5">
              Designed with inspiration from modern Indian transit UI. Simulated payment integration for demonstration only.
            </p>
          </div>

          {/* Simulated Payment Icons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-blue-400 mr-2">Simulated Gateway:</span>
            <span className="px-2 py-1 bg-white text-gray-800 font-bold text-[10px] rounded shadow">UPI</span>
            <span className="px-2 py-1 bg-white text-[#1A1F71] font-bold text-[10px] rounded shadow">RuPay</span>
            <span className="px-2 py-1 bg-white text-[#00579F] font-bold text-[10px] rounded shadow">VISA</span>
            <span className="px-2 py-1 bg-white text-[#EB001B] font-bold text-[10px] rounded shadow">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
