import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      <div className="bg-[#071A4D] text-white py-12 px-4 text-center">
        <h1 className="text-3xl font-black">Privacy Policy</h1>
        <p className="text-xs text-blue-200 mt-1">Last Updated: November 2026</p>
      </div>
      <div className="max-w-4xl mx-auto px-4 pt-10 text-xs text-gray-700 leading-relaxed space-y-6 bg-white p-8 sm:p-12 rounded-3xl shadow-card border border-gray-100 mt-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">1. Introduction & Academic Scope</h2>
          <p>
            YatraBus India operates as an academic capstone demonstration platform. This Privacy Policy outlines our procedures regarding passenger data, simulated payment references, and profile information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">2. Information Collection</h2>
          <p>
            During your booking simulation, we collect passenger names, ages, genders, contact phone numbers, and email addresses exclusively to issue digital tickets and populate your dashboard.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">3. Zero Financial Credentials Storage</h2>
          <p>
            No real credit card numbers, CVV codes, net banking passwords, or UPI PINs are ever collected, processed, or persisted. All transactions are simulated in local client memory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase">4. Cookies & Local Storage</h2>
          <p>
            We use browser LocalStorage to maintain your login session and preserve your active booking cart across browser refreshes.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

