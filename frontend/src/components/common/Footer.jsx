import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Twitter,
  Instagram,
  ShieldCheck,
  Clock,
  ChevronRight,
  Headphones
} from 'lucide-react';
import { CONTACT_CONFIG } from '../../config/contactConfig';
import ApiHealthBadge from './ApiHealthBadge';

const Footer = () => {
  const shareUrl = typeof window === 'undefined' ? '' : encodeURIComponent(window.location.origin);

  const socialLinks = [
    {
      label: 'Follow YATRA BUS on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      icon: Facebook
    },
    {
      label: 'Follow YATRA BUS on X',
      href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=Book%20verified%20intercity%20bus%20tickets%20with%20YATRA%20BUS`,
      icon: Twitter
    },
    {
      label: 'Connect with YATRA BUS on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      icon: Linkedin
    },
    {
      label: 'Follow YATRA BUS on Instagram',
      href: 'https://instagram.com',
      icon: Instagram
    }
  ];

  const quickLinks = [
    { label: 'Search Bus Tickets', path: '/buses' },
    { label: 'Popular Trips & Circuits', path: '/popular-trips' },
    { label: 'Short Weekend Getaways', path: '/short-trips' },
    { label: 'Explore Destinations', path: '/destinations' },
    { label: 'Customer Dashboard & E-Tickets', path: '/dashboard' }
  ];

  const popularRoutes = [
    { label: 'Kolkata ➔ Siliguri (Volvo 9600)', path: '/buses?origin=Kolkata&destination=Siliguri' },
    { label: 'Delhi ➔ Jaipur (AC Sleeper)', path: '/buses?origin=Delhi&destination=Jaipur' },
    { label: 'Mumbai ➔ Pune (Electric EV)', path: '/buses?origin=Mumbai&destination=Pune' },
    { label: 'Bengaluru ➔ Chennai (Multi-Axle)', path: '/buses?origin=Bengaluru&destination=Chennai' },
    { label: 'Hyderabad ➔ Vijayawada', path: '/buses?origin=Hyderabad&destination=Vijayawada' }
  ];

  return (
    <footer className="border-t border-slate-800/80 bg-[#0B0F19] text-slate-300 font-sans text-xs">
      {/* Upper Support Banner */}
      <div className="border-b border-slate-800/60 bg-[#0E1322]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-tight">Need assistance with your booking?</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Our dedicated round-the-clock helpdesk is ready to assist you.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${CONTACT_CONFIG.phone.tel}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold transition border border-slate-700/60 text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>{CONTACT_CONFIG.phone.display}</span>
              </a>
              <a
                href={`mailto:${CONTACT_CONFIG.supportEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 font-semibold transition border border-purple-800/50 text-xs"
              >
                <Mail className="w-3.5 h-3.5 text-purple-300" />
                <span>{CONTACT_CONFIG.supportEmail}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2.5 focus:outline-none">
              <img src="/logo.png" alt="YATRA BUS" className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs pr-4">
              YATRA BUS is India's trusted intercity bus travel platform, connecting over 250+ destinations with verified operators, live seat selection, transparent fares, and instant confirmed e-tickets.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Fleets</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>24x7 Assistance</span>
              </span>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700/60 hover:border-purple-600/60 text-slate-400 hover:text-white flex items-center justify-center transition"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Popular Corridors */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Popular Routes
            </h3>
            <ul className="space-y-2.5">
              {popularRoutes.map((route) => (
                <li key={route.label}>
                  <Link
                    to={route.path}
                    className="text-slate-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
                    <span>{route.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Corporate & Contact */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Corporate Office
            </h3>
            <div className="space-y-3 text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {CONTACT_CONFIG.headquarters.name}<br />
                  {CONTACT_CONFIG.headquarters.address}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <a
                  href={`tel:${CONTACT_CONFIG.phone.tel}`}
                  className="hover:text-purple-300 transition-colors"
                >
                  {CONTACT_CONFIG.phone.display} (Toll-Free)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <a
                  href={`mailto:${CONTACT_CONFIG.supportEmail}`}
                  className="hover:text-purple-300 transition-colors break-all"
                >
                  {CONTACT_CONFIG.supportEmail}
                </a>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Operating Hours: 24 Hours / 7 Days a Week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Compliance */}
      <div className="border-t border-slate-800/80 bg-[#080B12] py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} YATRA BUS India Private Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <ApiHealthBadge showVersion />
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
