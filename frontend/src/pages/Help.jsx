import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Phone, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Namaste! Welcome to YatraBus Support. How can we assist with your bus travel today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const faqs = [
    {
      q: 'How does seat selection and reservation work?',
      a: 'You can choose between lower and upper deck berths or seater layouts on our interactive graphical seat map. Once selected, your seat is held exclusively during your checkout to prevent double booking. You can select up to 6 seats in a single booking.'
    },
    {
      q: 'What is the bus cancellation and refund policy?',
      a: 'Most interstate operators offer free cancellation up to 6 hours before departure. Cancellations between 2 to 6 hours before departure are eligible for a 50% refund. In this demo platform, cancellations trigger an instant simulated refund to your dashboard.'
    },
    {
      q: 'Do I need to carry a printed ticket?',
      a: 'No. An SMS or digital m-ticket with your valid PNR along with an original Govt. Photo ID (Aadhaar, Voter ID, Passport, or Driving License) is sufficient for boarding with conductor verification.'
    },
    {
      q: 'How much luggage can I bring on the bus?',
      a: 'Passengers are entitled to carry up to 15 kg of personal luggage in the bus luggage compartment, plus a small cabin bag/backpack. Excessive commercial cargo may incur nominal operator baggage fees at the terminal.'
    },
    {
      q: 'Are ladies seats reserved exclusively for female travelers?',
      a: 'Yes. Seats designated as "Ladies" (highlighted with a pink icon on the seat map) can only be reserved by or adjacent to female passengers for comfort and safety.'
    }
  ];

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Thank you for asking about "${userMsg}". Our simulated bus concierge has verified that our interstate fleet is operating on schedule. For urgent assistance, please call 1800-287-9287.`
        }
      ]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="bg-gradient-to-r from-[#071A4D] via-[#0C247A] to-primary text-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-lg">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Passenger Help Center
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Frequently Asked Questions & Support
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Everything you need to know about booking, bus boarding points, seat policies, and digital tickets.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-black text-gray-900 mb-4">Common Questions</h3>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-primary transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate__animated animate__fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Simulated Live Support Chat Widget */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden flex flex-col h-[460px]">
              <div className="bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">YatraBus Virtual Assistant</h4>
                    <span className="text-[10px] text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online 24x7
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your query here..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white p-2 rounded-xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

