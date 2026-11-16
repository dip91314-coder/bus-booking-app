import React from 'react';
import { Bus, ShieldCheck, Award, Users, HeartHandshake, MapPin, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#071A4D] via-[#0C247A] to-primary text-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-lg">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            About YatraBus India
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Revolutionizing Road Transit Across India
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            YatraBus is an independent intercity bus company. Every route, coach, and ticket on this platform is operated and managed by YatraBus.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <ShieldCheck className="w-8 h-8 text-primary" />,
              title: 'Deterministic Seat Integrity',
              desc: 'Engineered with compound unique indexing at the database engine level to ensure absolute zero duplicate seat allocations.'
            },
            {
              icon: <Award className="w-8 h-8 text-accent" />,
              title: 'Customer-First Transparency',
              desc: 'Transparent pricing policies with zero convenience fees, clear live GPS fleet tracking, and verified conductor identities.'
            },
            {
              icon: <HeartHandshake className="w-8 h-8 text-emerald-600" />,
              title: 'One YatraBus Fleet',
              desc: 'We operate our own fleet and manage routes, schedules, seats, and customer support directly. Every booking is for a YatraBus coach.'
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                {pillar.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Direct YatraBus Service */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-gray-100 space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-3 py-1 rounded-full">
              Direct YatraBus Service
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">
              One Company, Every Journey
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2">
              Book directly with YatraBus for intercity journeys across India. We manage our own buses and schedules, so you can choose your seat and travel with one consistent YatraBus service from booking to arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs text-gray-700">
            <div>
              <span className="text-gray-400 block font-medium">Bus Service</span>
              <strong className="text-gray-900">YatraBus only</strong>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Route Network</span>
              <strong className="text-gray-900">Intercity journeys across India</strong>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Booking</span>
              <strong className="text-gray-900">Direct with YatraBus</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

