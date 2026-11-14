import React from 'react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="bg-[#071A4D] text-white py-12 px-4 text-center">
        <h1 className="text-3xl font-black">Terms & Conditions</h1>
        <p className="text-xs text-blue-200 mt-1">Effective: November 2026</p>
      </div>
      <div className="max-w-4xl mx-auto px-4 pt-10 text-xs text-gray-700 leading-relaxed space-y-6 bg-white p-8 sm:p-12 rounded-3xl shadow-card border border-gray-100 mt-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">1. Platform Services</h2>
          <p>
            YatraBus India provides a web-based intercity bus booking interface connecting passengers with scheduled interstate coach services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">2. Seat Allocation & PNR Validity</h2>
          <p>
            A confirmed booking with an issued PNR reference guarantees the assigned seat number on the designated bus departure. Passengers must arrive at their boarding terminal at least 15 minutes before scheduled departure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">3. Cancellation & Refund Rules</h2>
          <p>
            Cancellations made 6 hours prior to departure are eligible for a 100% simulated refund. Cancellations made between 2 to 6 hours before departure are eligible for a 50% refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">4. Code of Conduct</h2>
          <p>
            Passengers must treat conductors, drivers, and co-travelers with dignity. Smoking, consumption of alcohol, or transport of hazardous contraband is strictly prohibited on all coaches.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;

