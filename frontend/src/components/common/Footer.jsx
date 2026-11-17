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
    <footer className="border-t border-slate-200 bg-[#F5F7FA] py-12 text-sm text-slate-600 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div className="space-y-4">
          <Link to="/" className="inline-flex rounded-lg focus-visible:ring-2 focus-visible:ring-blue-400">
            <img src="/logo.png" alt="YatraBus" className="h-9 w-auto" />
          </Link>
          <p className="max-w-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Book safe, comfortable journeys across India with clear fares and dependable support.
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
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

        <nav aria-label="Quick links">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Quick Links</h2>
          <ul className="space-y-2.5">
            <li><Link to="/" className="transition hover:text-blue-700 focus-visible:text-blue-700">Home</Link></li>
            <li><Link to="/buses" className="transition hover:text-blue-700 focus-visible:text-blue-700">Booking</Link></li>
            <li><Link to="/routes" className="transition hover:text-blue-700 focus-visible:text-blue-700">Routes</Link></li>
            <li><Link to="/contact" className="transition hover:text-blue-700 focus-visible:text-blue-700">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Popular Routes</h2>
          <ul className="space-y-2.5">
            <li><Link to="/buses?origin=Kolkata&destination=Siliguri" className="transition hover:text-blue-700">Kolkata to Siliguri</Link></li>
            <li><Link to="/buses?origin=Delhi&destination=Jaipur" className="transition hover:text-blue-700">Delhi to Jaipur</Link></li>
            <li><Link to="/buses?origin=Mumbai&destination=Pune" className="transition hover:text-blue-700">Mumbai to Pune</Link></li>
            <li><Link to="/buses?origin=Bengaluru&destination=Chennai" className="transition hover:text-blue-700">Bengaluru to Chennai</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Contact Us</h2>
          <address className="space-y-3 not-italic">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              <span>{CONTACT_CONFIG.headquarters.name}<br />{CONTACT_CONFIG.headquarters.address}</span>
            </div>
            <a href={`tel:${CONTACT_CONFIG.phone.tel}`} className="flex items-center gap-2.5 transition hover:text-blue-700">
              <Phone className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              {CONTACT_CONFIG.phone.display}
            </a>
            <a href={`mailto:${CONTACT_CONFIG.supportEmail}`} className="flex items-center gap-2.5 transition hover:text-blue-700">
              <Mail className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              <span className="break-all">{CONTACT_CONFIG.supportEmail}</span>
            </a>
          </address>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 pt-5 text-xs text-slate-500 sm:px-6 md:flex-row dark:border-slate-800 dark:text-slate-400">
        <p>© 2026 YatraBus India Private Limited. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <ApiHealthBadge showVersion />
          <Link to="/privacy-policy" className="hover:text-blue-700">Privacy</Link>
          <Link to="/terms-and-conditions" className="hover:text-blue-700">Terms</Link>
          <Link to="/help" className="hover:text-blue-700">Help Center</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
