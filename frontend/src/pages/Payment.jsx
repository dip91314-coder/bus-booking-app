import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  ShieldCheck,
  Lock,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedBus, selectedSeats, confirmBooking } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking, wallet
  const [upiId, setUpiId] = useState('rahul@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardHolder, setCardHolder] = useState('RAHUL SEN');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    if (!selectedBus || selectedSeats.length === 0) {
      navigate('/buses');
    }
  }, [selectedBus, selectedSeats]);

  const baseFare = selectedSeats.reduce((acc, curr) => acc + (curr.price || selectedBus?.fare || 0), 0);
  const totalAmount = Math.round(baseFare * 1.05); // including 5% tax

  const handleTestAutoFill = () => {
    setUpiId('demo.passenger@okhdfcbank');
    setCardNumber('4532 8901 2345 6789');
    setCardHolder('DEMO TRAVELER');
    setCardExpiry('12/28');
    setCardCvv('123');
    toast.success('Filled with test demonstration credentials!');
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep('Connecting to simulated banking gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing reservation with bus fleet controller...');
    }, 1000);

    setTimeout(() => {
      setProcessingStep('Generating verifiable PNR and atomic seat locks...');
    }, 2000);

    setTimeout(() => {
      const confirmed = confirmBooking({
        paymentMethod:
          paymentMethod === 'upi'
            ? `UPI (${upiId})`
            : paymentMethod === 'card'
            ? `Card (Ending in ${cardNumber.slice(-4)})`
            : `Net Banking (${selectedBank.toUpperCase()})`,
        contactEmail: user?.email || 'rahul@yatra.com',
        contactPhone: user?.phone || '9876543210'
      });

      setIsProcessing(false);
      if (confirmed) {
        toast.success(`Booking Confirmed! PNR: ${confirmed.pnr}`, { duration: 5000 });
        navigate(`/booking/confirmation/${confirmed.pnr}`);
      } else {
        toast.error('Booking confirmation failed. Please try again.');
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] pb-24">
      {/* Header */}
      <div className="bg-[#071A4D] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-blue-900/80 hover:bg-blue-800 flex items-center justify-center text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Simulated Payment Checkout</h1>
              <p className="text-xs text-blue-200 mt-0.5">
                Amount Payable: <strong className="text-accent text-sm">₹{totalAmount}</strong> (Zero Convenience Fee)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-700/50">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Demo Sandbox</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Academic Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Academic Project Demo Gateway</strong>
              <p className="text-blue-700 mt-0.5">
                No real credit card or bank credentials will ever be charged. This simulated checkout fulfills Phase 1 frontend requirements.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestAutoFill}
            className="self-start sm:self-auto bg-primary hover:bg-primary-dark text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition whitespace-nowrap"
          >
            Auto-Fill Test Info
          </button>
        </div>

        {/* Processing Modal Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-5 animate__animated animate__zoomIn">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto border-2 border-primary/20">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Processing Booking</h3>
                <p className="text-xs text-primary font-bold mt-2 animate-pulse">{processingStep}</p>
                <p className="text-[11px] text-gray-400 mt-1">Please do not refresh or press back...</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Payment Method Selector Sidebar */}
          <div className="md:col-span-4 space-y-2">
            {[
              {
                id: 'upi',
                title: 'UPI (GPay / PhonePe / Paytm)',
                desc: 'Instant QR code or UPI ID',
                icon: <QrCode className="w-5 h-5 text-primary" />
              },
              {
                id: 'card',
                title: 'Debit / Credit Card',
                desc: 'Visa, RuPay, MasterCard',
                icon: <CreditCard className="w-5 h-5 text-accent" />
              },
              {
                id: 'netbanking',
                title: 'Net Banking',
                desc: 'All major Indian banks',
                icon: <Building2 className="w-5 h-5 text-emerald-600" />
              },
              {
                id: 'wallet',
                title: 'Wallets & PayLater',
                desc: 'Amazon Pay, Mobikwik',
                icon: <Wallet className="w-5 h-5 text-purple-600" />
              }
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                  paymentMethod === method.id
                    ? 'border-primary bg-white shadow-card ring-2 ring-primary/20'
                    : 'border-gray-200 bg-white/60 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">{method.icon}</div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900">{method.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{method.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Payment Form Details */}
          <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
            <form onSubmit={handleSimulatePayment} className="space-y-6">
              {/* UPI Tab */}
              {paymentMethod === 'upi' && (
                <div className="space-y-5 animate__animated animate__fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-sm font-extrabold text-gray-900">Scan UPI QR or Enter VPA</h3>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Zero Surcharge
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    {/* Simulated QR */}
                    <div className="w-36 h-36 bg-white p-2 rounded-xl border border-gray-200 flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <QrCode className="w-28 h-28 text-gray-800" />
                      <span className="text-[9px] font-mono font-bold text-primary mt-1">BHIM UPI DEMO</span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-2 text-center sm:text-left">
                      <p className="font-bold text-gray-900">Scan with any UPI application:</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                        <span className="bg-white px-2 py-1 rounded border text-[10px] font-bold shadow-xs">Google Pay</span>
                        <span className="bg-white px-2 py-1 rounded border text-[10px] font-bold shadow-xs">PhonePe</span>
                        <span className="bg-white px-2 py-1 rounded border text-[10px] font-bold shadow-xs">Paytm</span>
                        <span className="bg-white px-2 py-1 rounded border text-[10px] font-bold shadow-xs">BHIM</span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Scan the code or verify using your Virtual Payment Address (VPA) below.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      placeholder="username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 animate__animated animate__fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-sm font-extrabold text-gray-900">Enter Card Information</h3>
                    <div className="flex gap-1 text-[10px] font-bold text-gray-500">
                      <span>Visa</span> • <span>RuPay</span> • <span>MasterCard</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="NAME ON CARD"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary uppercase font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Net Banking Tab */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-4 animate__animated animate__fadeIn">
                  <h3 className="text-sm font-extrabold text-gray-900 pb-2 border-b">
                    Select Your Bank
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'sbi', name: 'State Bank of India (SBI)' },
                      { id: 'hdfc', name: 'HDFC Bank' },
                      { id: 'icici', name: 'ICICI Bank' },
                      { id: 'axis', name: 'Axis Bank' },
                      { id: 'pnb', name: 'Punjab National Bank' },
                      { id: 'kotak', name: 'Kotak Mahindra Bank' }
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                          selectedBank === bank.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet Tab */}
              {paymentMethod === 'wallet' && (
                <div className="space-y-3 animate__animated animate__fadeIn">
                  <h3 className="text-sm font-extrabold text-gray-900 pb-2 border-b">
                    Choose Digital Wallet
                  </h3>
                  <div className="space-y-2">
                    {['Amazon Pay Balance', 'Mobikwik ZIP', 'Airtel Money'].map((wallet, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-bold text-gray-800"
                      >
                        <input
                          type="radio"
                          name="walletOption"
                          defaultChecked={idx === 0}
                          className="text-primary focus:ring-primary"
                        />
                        <span>{wallet}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Total Amount to Pay</span>
                  <span className="text-2xl font-black text-primary font-sans">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-accent hover:bg-accent-hover active:scale-[0.99] text-white font-extrabold text-sm py-3.5 px-8 rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirm & Pay ₹{totalAmount}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

