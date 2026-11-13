import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-16 pb-8 text-[#475569] font-sans text-sm">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* 4 Clean Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#F1F5F9]">
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
            <p className="text-sm text-[#64748B] leading-relaxed">
              India's premier intercity bus ticket booking platform. Verified operators, safe travels, and transparent fares.
            </p>
          </div>

          {/* Col 2: Company */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-[#475569]">
              <li><Link to="/about" className="hover:text-[#5B21B6] transition-colors">About Us</Link></li>
              <li><Link to="/about" className="hover:text-[#5B21B6] transition-colors">Corporate Profile</Link></li>
              <li><Link to="/about" className="hover:text-[#5B21B6] transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-[#5B21B6] transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#5B21B6] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-[#5B21B6] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Routes */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">
              Popular Routes
            </h3>
            <ul className="space-y-2.5 text-sm text-[#475569]">
              <li><Link to="/buses?origin=Kolkata&destination=Siliguri" className="hover:text-[#5B21B6] transition-colors">Kolkata to Siliguri</Link></li>
              <li><Link to="/buses?origin=Delhi&destination=Jaipur" className="hover:text-[#5B21B6] transition-colors">Delhi to Jaipur</Link></li>
              <li><Link to="/buses?origin=Mumbai&destination=Pune" className="hover:text-[#5B21B6] transition-colors">Mumbai to Pune</Link></li>
              <li><Link to="/buses?origin=Bengaluru&destination=Chennai" className="hover:text-[#5B21B6] transition-colors">Bengaluru to Chennai</Link></li>
              <li><Link to="/buses?origin=Delhi&destination=Manali" className="hover:text-[#5B21B6] transition-colors">Delhi to Manali</Link></li>
              <li><Link to="/buses?origin=Hyderabad&destination=Bengaluru" className="hover:text-[#5B21B6] transition-colors">Hyderabad to Bengaluru</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">
              Head Office
            </h3>
            <div className="space-y-3 text-sm text-[#475569]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#5B21B6] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Yatra Solutions Pvt. Ltd.<br />
                  Patuli, Kolkata - 700016, West Bengal, India
                </span>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-[#0F172A] font-medium">
                <Phone className="w-4 h-4 text-[#5B21B6] shrink-0" />
                <span>+91 20 6686 2800</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#0F172A] font-medium">
                <Mail className="w-4 h-4 text-[#5B21B6] shrink-0" />
                <span>support@yatrabus.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-3">
          <p>&copy; {new Date().getFullYear()} YatraBus India Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-[#0F172A] transition-colors">Privacy</Link>
            <Link to="/terms-and-conditions" className="hover:text-[#0F172A] transition-colors">Terms</Link>
            <Link to="/help" className="hover:text-[#0F172A] transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
