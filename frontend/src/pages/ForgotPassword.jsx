import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid registered email address.');
      return;
    }
    setSubmitted(true);
    toast.success('Password reset link sent to your registered email address.');
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 shadow-elevated border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mx-auto shadow-md">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Reset Password</h2>
          <p className="text-xs text-gray-500">
            Enter your email and we'll send you a secure verification link to update your credentials.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 animate__animated animate__fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-emerald-900">Reset Link Dispatched</h4>
            <p className="text-xs text-emerald-700">
              We have dispatched a simulated password reset token to <strong>{email}</strong>.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="bg-primary text-white font-bold text-xs px-4 py-2 rounded-xl inline-block"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Reset Link</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

