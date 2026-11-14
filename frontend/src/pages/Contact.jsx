import React from 'react';
import { MapPin, Phone, ShieldCheck, Clock } from 'lucide-react';
import ContactWithGlobe from '../components/ui/contact-with-globe';
import { CONTACT_CONFIG } from '../config/contactConfig';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 font-sans transition-colors duration-200">
      {/* Interactive 3D Globe & Functional Form */}
      <ContactWithGlobe
        title="We're Here For Your Journey"
        subtitle="24/7 Global & Domestic Transit Support"
        description="Have a question about bus schedules, ticket reservations, cancellations, seat selections, or route connections? Connect with our dedicated 24/7 dispatch desk."
      />

      {/* 3 Info Cards below Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14" aria-label="Support Channels">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: National Dispatch HQ */}
          <div className="bg-white dark:bg-[#111622] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50 text-[#5B21B6] dark:text-purple-300 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#5B21B6] dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/40">
                {CONTACT_CONFIG.headquarters.badge}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {CONTACT_CONFIG.headquarters.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {CONTACT_CONFIG.headquarters.building}<br />
                {CONTACT_CONFIG.headquarters.address}
              </p>
            </div>
          </div>

          {/* Card 2: Toll-Free Helpline */}
          <div className="bg-white dark:bg-[#111622] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/40">
                {CONTACT_CONFIG.phone.hours}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Toll-Free Helpline
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Call our direct centralized helpline anytime for real-time trip status or booking changes.
              </p>
              <a
                href={`tel:${CONTACT_CONFIG.phone.tel}`}
                className="inline-flex items-center text-sm font-bold text-[#5B21B6] dark:text-purple-400 hover:underline pt-1"
              >
                {CONTACT_CONFIG.phone.display}
              </a>
            </div>
          </div>

          {/* Card 3: Passenger Assurance */}
          <div className="bg-white dark:bg-[#111622] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                Zero Double Booking
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Passenger Assurance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deterministic seat allocation guarantee, verified operators, and instant simulated booking confirmation.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                <span>Average response: under 5 mins</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
