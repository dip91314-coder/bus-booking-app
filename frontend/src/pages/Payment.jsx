import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { bookingApi, paymentApi, offerApi } from '../services/api';
import PaymentProcessingModal from '../components/common/PaymentProcessingModal';
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
  Loader2,
  Zap,
  Tag,
  Percent,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/common/Button';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedBus,
    selectedSeats,
    passengers,
    contactDetails,
    confirmBooking,
    searchParams,
    selectedBoardingPoint,
    selectedDroppingPoint
  } = useBooking();
  const { addNotification } = useNotifications();

  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking, wallet
  const [upiId, setUpiId] = useState('rahul@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardHolder, setCardHolder] = useState('RAHUL SEN');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [availableOffers, setAvailableOffers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    offerApi.getOffers().then((offers) => {
      if (isMounted && Array.isArray(offers)) {
        setAvailableOffers(offers);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to complete your booking.');
      navigate('/login', { state: { from: '/booking/payment' } });
      return;
    }
    if (!selectedBus || selectedSeats.length === 0) {
      navigate('/buses');
    }
  }, [selectedBus, selectedSeats, user]);

  const baseFare = selectedSeats.reduce((acc, curr) => acc + (curr.price || selectedBus?.fare || 0), 0);
  const taxAmount = Math.round(baseFare * 0.05); // 5% tax
  const grossAmount = baseFare + taxAmount;
  const discountAmount = appliedOffer?.discount || 0;
  const totalAmount = Math.max(0, grossAmount - discountAmount);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim();
    if (!code) {
      toast.error('Please enter a coupon code.');
      return;
    }
    setIsValidatingCoupon(true);
    try {
      const isMongoId = (val) => Boolean(val && /^[0-9a-fA-F]{24}$/.test(val));
      const tripId = isMongoId(selectedBus?.tripId)
        ? selectedBus.tripId
        : isMongoId(selectedBus?.id)
        ? selectedBus.id
        : undefined;

      const res = await offerApi.validateOffer({
        code,
        tripId,
        seats: selectedSeats.map((s) => s.number || s.seatNumber),
        amount: grossAmount,
      });

      if (res.success && res.data) {
        setAppliedOffer(res.data);
        setCouponCode(res.data.code);
        toast.success(res.message || `Coupon ${res.data.code} applied! Saved ₹${res.data.discount}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid coupon code';
      toast.error(msg);
      setAppliedOffer(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedOffer(null);
    setCouponCode('');
    toast.success('Coupon removed.');
  };

  const handleTestAutoFill = () => {
    setUpiId('demo.passenger@okhdfcbank');
    setCardNumber('4532 8901 2345 6789');
    setCardHolder('DEMO TRAVELER');
    setCardExpiry('12/28');
    setCardCvv('123');
    toast.success('Filled with test demonstration credentials!');
  };

  const handleSimulatePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) {
      toast.error('Please log in to complete your booking.');
      navigate('/login', { state: { from: '/booking/payment' } });
      return;
    }
    setIsProcessing(true);
    setProcessingStep('Connecting to secure banking gateway...');

    const resolvedMethod =
      paymentMethod === 'upi'
        ? `UPI (${upiId})`
        : paymentMethod === 'card'
        ? `Card (Ending in ${cardNumber.slice(-4)})`
        : `Net Banking (${selectedBank.toUpperCase()})`;

    try {
      const seatNumbers = selectedSeats.map((s) => s.number || s.seatNumber);
      const isMongoId = (val) => Boolean(val && /^[0-9a-fA-F]{24}$/.test(val));
      const tripId = isMongoId(selectedBus?.tripId)
        ? selectedBus.tripId
        : isMongoId(selectedBus?.id)
        ? selectedBus.id
        : undefined;

      let serverBooking = null;
      let ticketEmailSent = null;

      if (tripId) {
        setProcessingStep('Reserving atomic seat locks on bus trip...');
        try {
          const bookingPayload = {
            tripId,
            from_location: selectedBus?.origin || searchParams.origin,
            to_location: selectedBus?.destination || searchParams.destination,
            pickup_point: selectedBoardingPoint?.name || '',
            drop_point: selectedDroppingPoint?.name || '',
            latitude: selectedBoardingPoint?.latitude ?? undefined,
            longitude: selectedBoardingPoint?.longitude ?? undefined,
            boardingPoint: selectedBoardingPoint?.name || '',
            droppingPoint: selectedDroppingPoint?.name || '',
            seats: seatNumbers,
            passengers:
              passengers.length > 0
                ? passengers.map((p, idx) => ({
                    seatNumber: seatNumbers[idx] || p.seatNumber,
                    name: p.name,
                    age: Number(p.age),
                    gender: p.gender || 'male'
                  }))
                : seatNumbers.map((s) => ({
                    seatNumber: s,
                    name: user?.name || 'Passenger',
                    age: 25,
                    gender: 'male'
                  })),
            contactEmail: contactDetails?.email || user?.email || passengers?.[0]?.email || '',
            contactPhone: contactDetails?.phone || user?.phone || ''
          };

          const bRes = await bookingApi.createBooking(bookingPayload);
          if (bRes?.success && bRes.data) {
            serverBooking = bRes.data;
            const bId = serverBooking.bookingId || serverBooking.id || serverBooking._id;
            setProcessingStep('Authorizing payment transaction & generating digital ticket...');
            const initRes = await paymentApi.initiatePayment(bId);
            const verifyRes = await paymentApi.verifyPayment({
              bookingId: bId,
              orderId: initRes?.orderId,
              paymentId: `PAY-${Date.now()}`,
              signature: 'mock_signature',
              paymentMethod: resolvedMethod
            });
            ticketEmailSent = verifyRes?.emailSent;
            if (verifyRes?.ticket?.pnr) {
              serverBooking.pnr = verifyRes.ticket.pnr;
            } else if (serverBooking.pnr || serverBooking.bookingReference) {
              serverBooking.pnr = serverBooking.pnr || serverBooking.bookingReference;
            }
          }
        } catch (apiErr) {
          if (apiErr.response?.status === 401) {
            setIsProcessing(false);
            toast.error('Session expired. Please log in to complete your booking.');
            navigate('/login', { state: { from: '/booking/payment' } });
            return;
          }
          console.warn('Backend API booking notice:', apiErr?.message);
        }
      }

      setProcessingStep('Finalizing reservation & generating PNR...');
      const resolvedEmail = contactDetails?.email || user?.email || passengers?.[0]?.email || '';
      const resolvedPhone = contactDetails?.phone || user?.phone || '';
      const confirmed = confirmBooking({
        paymentMethod: resolvedMethod,
        contactEmail: resolvedEmail,
        contactPhone: resolvedPhone,
        bookingReference: serverBooking?.pnr || serverBooking?.bookingReference
      });

      const finalPnr = serverBooking?.pnr || serverBooking?.bookingReference || confirmed?.pnr || `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      addNotification({
        title: 'Payment received',
        message: `Payment of ₹${totalAmount} for booking ${finalPnr} was received.`,
        type: 'payment'
      });
      if (ticketEmailSent === false) {
        toast.error('Booking confirmed, but the ticket email was not delivered. Check SMTP settings and the booking email address.');
      }

      setTimeout(() => {
        setIsProcessing(false);
        toast.success(`Booking Confirmed! PNR: ${finalPnr}`, { duration: 5000 });
        navigate(`/booking/confirmation/${finalPnr}`);
      }, 700);
    } catch (err) {
      setIsProcessing(false);
      toast.error('Booking confirmation encountered an error. Please retry.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      <PaymentProcessingModal
        isOpen={isProcessing}
        currentStepMessage={processingStep}
        amount={totalAmount}
      />
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

              {/* Offers & Coupons Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-accent" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                      Promo Code & Offers
                    </h4>
                  </div>
                  {appliedOffer && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> {appliedOffer.code} Applied
                    </span>
                  )}
                </div>

                {/* Input box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. YATRAFIRST)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={Boolean(appliedOffer) || isValidatingCoupon}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                  />
                  {appliedOffer ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-dark text-white rounded-xl transition disabled:opacity-50"
                    >
                      {isValidatingCoupon ? 'Validating...' : 'Apply'}
                    </button>
                  )}
                </div>

                {/* Quick available offers list */}
                {availableOffers.length > 0 && !appliedOffer && (
                  <div className="pt-2">
                    <span className="text-[11px] text-gray-500 dark:text-slate-400 block mb-1.5 font-medium">
                      Available offers for this trip:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableOffers.slice(0, 4).map((off) => (
                        <button
                          key={off._id || off.code}
                          type="button"
                          onClick={() => handleApplyCoupon(off.code)}
                          className="text-[11px] font-bold text-primary dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs"
                        >
                          <Tag className="w-3 h-3 text-accent" />
                          <span>{off.code}</span>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">
                            ({off.discountType === 'percent' ? `${off.value}% OFF` : `₹${off.value} OFF`})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applied details breakdown */}
                {appliedOffer && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{appliedOffer.title}</p>
                      <p className="text-[11px] opacity-90">{appliedOffer.description}</p>
                    </div>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                      -₹{appliedOffer.discount}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-400 pt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Base Seat Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                  <span className="font-medium text-gray-900 dark:text-slate-200">₹{baseFare}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Service Taxes (5%)</span>
                  <span className="font-medium text-gray-900 dark:text-slate-200">₹{taxAmount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Coupon Discount ({appliedOffer?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Total Amount to Pay</span>
                  <span className="text-2xl font-black text-primary font-sans">₹{totalAmount}</span>
                </div>

                <Button
                  type="submit"
                  loading={isProcessing}
                  size="lg"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing payment...' : `Confirm & Pay ₹${totalAmount}`}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

