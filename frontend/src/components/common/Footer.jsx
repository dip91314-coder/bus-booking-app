import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, MapPin, Phone, Mail, Twitter } from 'lucide-react';
import { CONTACT_CONFIG } from '../../config/contactConfig';
import ApiHealthBadge from './ApiHealthBadge';

const Footer = () => {
  const shareUrl = typeof window === 'undefined' ? '' : encodeURIComponent(window.location.origin);
  const socialLinks = [
    {
      label: 'Share YatraBus on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      icon: Facebook
    },
    {
      label: 'Share YatraBus on X',
      href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=Plan%20your%20next%20bus%20journey%20with%20YatraBus`,
      icon: Twitter
    },
    {
      label: 'Share YatraBus on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      icon: Linkedin
    }
  ];

  return (
    <footer className="border-t border-slate-700 bg-[#0F172A] py-12 text-sm text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div className="space-y-4">
          <Link to="/" className="inline-flex rounded-lg focus-visible:ring-2 focus-visible:ring-blue-400">
            <img src="/logo.png" alt="YatraBus" className="h-9 w-auto" />
          </Link>
          <p className="max-w-sm leading-relaxed text-slate-400">
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition hover:border-blue-400 hover:bg-blue-600 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Quick links">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Quick Links</h2>
          <ul className="space-y-2.5">
            <li><Link to="/" className="transition hover:text-blue-300 focus-visible:text-blue-300">Home</Link></li>
            <li><Link to="/buses" className="transition hover:text-blue-300 focus-visible:text-blue-300">Booking</Link></li>
            <li><Link to="/routes" className="transition hover:text-blue-300 focus-visible:text-blue-300">Routes</Link></li>
            <li><Link to="/contact" className="transition hover:text-blue-300 focus-visible:text-blue-300">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Popular Routes</h2>
          <ul className="space-y-2.5">
            <li><Link to="/buses?origin=Kolkata&destination=Siliguri" className="transition hover:text-blue-300">Kolkata to Siliguri</Link></li>
            <li><Link to="/buses?origin=Delhi&destination=Jaipur" className="transition hover:text-blue-300">Delhi to Jaipur</Link></li>
            <li><Link to="/buses?origin=Mumbai&destination=Pune" className="transition hover:text-blue-300">Mumbai to Pune</Link></li>
            <li><Link to="/buses?origin=Bengaluru&destination=Chennai" className="transition hover:text-blue-300">Bengaluru to Chennai</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Contact Us</h2>
          <address className="space-y-3 not-italic">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              <span>{CONTACT_CONFIG.headquarters.name}<br />{CONTACT_CONFIG.headquarters.address}</span>
            </div>
            <a href={`tel:${CONTACT_CONFIG.phone.tel}`} className="flex items-center gap-2.5 transition hover:text-blue-300">
              <Phone className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              {CONTACT_CONFIG.phone.display}
            </a>
            <a href={`mailto:${CONTACT_CONFIG.supportEmail}`} className="flex items-center gap-2.5 transition hover:text-blue-300">
              <Mail className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              <span className="break-all">{CONTACT_CONFIG.supportEmail}</span>
            </a>
          </address>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-slate-700 px-5 pt-5 text-xs text-slate-400 sm:px-6 md:flex-row">
        <p>© 2026 YatraBus India Private Limited. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <ApiHealthBadge showVersion />
          <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
          <Link to="/terms-and-conditions" className="hover:text-white">Terms</Link>
          <Link to="/help" className="hover:text-white">Help Center</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
