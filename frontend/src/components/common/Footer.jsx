import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-purple-100 pt-16 pb-8 text-slate-600 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main 5-column navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-purple-50">
          {/* Brand Logo column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="YatraBus Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B0764] to-[#7E22CE] items-center justify-center text-white shadow-sm">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-[#3B0764] tracking-tight">
                Yatra<span className="text-[#7E22CE]">Bus</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Premium intercity travel and luxury bus coach network across India.
            </p>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/about" className="hover:text-[#7E22CE] transition">Overview</Link></li>
              <li><Link to="/about" className="hover:text-[#7E22CE] transition">Corporate Profile</Link></li>
              <li><Link to="/about" className="hover:text-[#7E22CE] transition">Directors</Link></li>
              <li><Link to="/about" className="hover:text-[#7E22CE] transition">Management</Link></li>
              <li><Link to="/about" className="hover:text-[#7E22CE] transition">CSR</Link></li>
              <li><Link to="/about" className="hover:text-[#7E22CE] transition">Milestones</Link></li>
              <li><Link to="/about" className="hover:text-[#7E22CE] transition">Awards</Link></li>
            </ul>
          </div>

          {/* Our Offerings */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Our Offerings
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/buses" className="hover:text-[#7E22CE] transition">City Bus</Link></li>
              <li><Link to="/destinations" className="hover:text-[#7E22CE] transition">Intercity Bus</Link></li>
              <li><Link to="/routes" className="hover:text-[#7E22CE] transition">Bus Tours</Link></li>
              <li><Link to="/destinations" className="hover:text-[#7E22CE] transition">Holidays</Link></li>
              <li><Link to="/help" className="hover:text-[#7E22CE] transition">BRTS</Link></li>
              <li><Link to="/help" className="hover:text-[#7E22CE] transition">MSRTC</Link></li>
              <li><Link to="/routes" className="hover:text-[#7E22CE] transition">Rentals</Link></li>
            </ul>
          </div>

          {/* Routes */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Routes
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/buses?origin=Pune&destination=Nagpur" className="hover:text-[#7E22CE] transition">Pune to Nagpur</Link></li>
              <li><Link to="/buses?origin=Nagpur&destination=Pune" className="hover:text-[#7E22CE] transition">Nagpur to Pune</Link></li>
              <li><Link to="/buses?origin=Pune&destination=Mumbai" className="hover:text-[#7E22CE] transition">Pune to Mumbai</Link></li>
              <li><Link to="/buses?origin=Mumbai&destination=Pune" className="hover:text-[#7E22CE] transition">Mumbai to Pune</Link></li>
              <li><Link to="/buses?origin=Pune&destination=Goa" className="hover:text-[#7E22CE] transition">Pune to Goa</Link></li>
              <li><Link to="/buses?origin=Goa&destination=Pune" className="hover:text-[#7E22CE] transition">Goa to Pune</Link></li>
              <li><Link to="/buses?origin=Pune&destination=Nashik" className="hover:text-[#7E22CE] transition">Pune to Nashik</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Contact Details
            </h4>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7E22CE] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Prasanna Purple Mobility Solutions Pvt. Ltd.<br />
                  Haridwar Enclave, Off Senapati Bapat Road, Shivajinagar, Pune - 411016
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-slate-700 font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" />
                <span>+91 20 6686 2800</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Mail className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" />
                <span>support@purplebus.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Links Bar */}
        <div className="py-4 flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-slate-500 border-b border-purple-50">
          <Link to="/login" className="hover:text-[#7E22CE] transition">Agent Login</Link>
          <span>•</span>
          <Link to="/register" className="hover:text-[#7E22CE] transition">Agent Registration</Link>
          <span>•</span>
          <Link to="/help" className="hover:text-[#7E22CE] transition">Support Desk</Link>
          <span>•</span>
          <Link to="/privacy-policy" className="hover:text-[#7E22CE] transition">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms-and-conditions" className="hover:text-[#7E22CE] transition">Terms & Conditions</Link>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>&copy; {new Date().getFullYear()} YatraBus India. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-bold text-[#7E22CE]">YatraBus</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
