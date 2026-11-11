import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Headphones, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pnr: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }
    setSubmitted(true);
    toast.success('Your support request has been registered. Our representative will contact you shortly.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      <div className="bg-gradient-to-r from-[#071A4D] via-[#0C247A] to-primary text-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-lg">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            24x7 Customer Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            We Are Here to Assist Your Journey
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Need help with seat allocation, route timings, or simulated refund inquiries? Our round-the-clock team is available 24/7.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-6">
              <h3 className="text-base font-extrabold text-gray-900 pb-2 border-b">
                Transit Headquarters & Hubs
              </h3>

              <div className="space-y-4 text-xs text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-bold">New Delhi Central Office:</strong>
                    <span>Regal Building, Connaught Place, New Delhi 110001, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-accent flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-bold">Toll-Free Helpline:</strong>
                    <span>1800-287-9287 (24 Hours / 7 Days)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-bold">Passenger Grievances:</strong>
                    <span>support@yatrabus.in • helpdesk@bharattransit.org</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-navy text-white rounded-3xl p-6 shadow-card space-y-2">
              <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase">
                <Clock className="w-4 h-4" /> Average Response Time
              </div>
              <h4 className="text-xl font-black">Under 5 Minutes</h4>
              <p className="text-xs text-blue-200">
                Live telephone operators and chat representatives prioritize passengers with imminent departures within 2 hours.
              </p>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-gray-100">
            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900">Message Received!</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Thank you, {formData.name}. We have logged ticket support ticket #SUP-{Math.floor(Math.random() * 90000 + 10000)} for your inquiry.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-extrabold text-gray-900 mb-2">Send Us an Inquiry</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Booking PNR (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. BK-98F42A7C"
                      value={formData.pnr}
                      onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Your Message or Issue</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your question or journey details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white font-extrabold text-sm py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Support Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

