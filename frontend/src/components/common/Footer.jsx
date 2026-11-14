import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { CONTACT_CONFIG } from '../../config/contactConfig';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#0B0F19] border-t border-[#E2E8F0] dark:border-slate-800 pt-16 pb-8 text-[#475569] dark:text-slate-400 font-sans text-sm transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* 4 Clean Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#F1F5F9] dark:border-slate-800/80">
          {/* Col 1: About YatraBus */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="YatraBus"
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
              />
            </Link>
            <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
              India's premier intercity bus ticket booking platform. Verified operators, safe travels, and transparent fares.
            </p>
          </div>

          {/* Col 2: Company */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-[#475569] dark:text-slate-400">
              <li><Link to="/about" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link to="/about" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Corporate Profile</Link></li>
              <li><Link to="/about" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Routes */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white uppercase tracking-wider mb-4">
              Popular Routes
            </h3>
            <ul className="space-y-2.5 text-sm text-[#475569] dark:text-slate-400">
              <li><Link to="/buses?origin=Kolkata&destination=Siliguri" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Kolkata to Siliguri</Link></li>
              <li><Link to="/buses?origin=Delhi&destination=Jaipur" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Delhi to Jaipur</Link></li>
              <li><Link to="/buses?origin=Mumbai&destination=Pune" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Mumbai to Pune</Link></li>
              <li><Link to="/buses?origin=Bengaluru&destination=Chennai" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Bengaluru to Chennai</Link></li>
              <li><Link to="/buses?origin=Delhi&destination=Manali" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Delhi to Manali</Link></li>
              <li><Link to="/buses?origin=Hyderabad&destination=Bengaluru" className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">Hyderabad to Bengaluru</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white uppercase tracking-wider mb-4">
              Head Office
            </h3>
            <div className="space-y-3 text-sm text-[#475569] dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#5B21B6] dark:text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Yatra Solutions Pvt. Ltd.<br />
                  Patuli, Kolkata - 700016, West Bengal, India
                </span>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-[#0F172A] dark:text-slate-200 font-medium">
                <Phone className="w-4 h-4 text-[#5B21B6] dark:text-purple-400 shrink-0" aria-hidden="true" />
                <a href={`tel:${CONTACT_CONFIG.phone.tel}`} className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">
                  {CONTACT_CONFIG.phone.display}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-[#0F172A] dark:text-slate-200 font-medium">
                <Mail className="w-4 h-4 text-[#5B21B6] dark:text-purple-400 shrink-0" aria-hidden="true" />
                <a href={`mailto:${CONTACT_CONFIG.supportEmail}`} className="hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors">
                  {CONTACT_CONFIG.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] dark:text-slate-500 gap-3">
          <p>&copy; {new Date().getFullYear()} YatraBus India Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-[#0F172A] dark:hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms-and-conditions" className="hover:text-[#0F172A] dark:hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/help" className="hover:text-[#0F172A] dark:hover:text-slate-300 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
