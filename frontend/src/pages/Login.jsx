import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Mail, Lock, LogIn, ArrowRight, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loginType, setLoginType] = useState('user'); // 'user' or 'agent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = async (type, autoSubmit = false) => {
    let targetEmail = '';
    let targetPassword = '';
    if (type === 'agent') {
      setLoginType('agent');
      targetEmail = 'admin@bharatbus.com';
      targetPassword = 'admin123';
    } else {
      setLoginType('user');
      targetEmail = 'rahul@yatra.com';
      targetPassword = 'rahul123';
    }
    setEmail(targetEmail);
    setPassword(targetPassword);

    if (autoSubmit) {
      setError('');
      setLoading(true);
      try {
        const loggedUser = await login(targetEmail, targetPassword);
        if (loggedUser.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Authentication failed.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[85vh] bg-white dark:bg-[#0B0F19] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#111622] rounded-3xl p-8 sm:p-10 shadow-xl shadow-purple-900/5 border border-purple-100 dark:border-slate-800">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center mb-3 group">
            <img
              src="/logo.svg"
              alt="YatraBus Logo"
              className="h-10 w-auto transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {loginType === 'agent' ? 'Agent & Fleet Partner Portal' : 'Sign In to Your Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {loginType === 'agent'
              ? 'Access terminal manifests, route schedules, and agent commissions.'
              : 'Access your bus bookings, manage digital tickets, and use Purple Wallet.'}
          </p>
        </div>

        {/* Tab Switcher: Passenger vs Agent Login */}
        <div className="bg-purple-50/80 p-1.5 rounded-2xl border border-purple-100 flex items-center mb-6">
          <button
            type="button"
            onClick={() => setLoginType('user')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              loginType === 'user'
                ? 'bg-[#3B0764] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#3B0764]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Passenger Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginType('agent')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              loginType === 'agent'
                ? 'bg-[#3B0764] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#3B0764]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Agent / Admin</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginType === 'agent' ? 'admin@bharatbus.com' : 'name@example.com'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E22CE] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-[#7E22CE] hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7E22CE] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#3B0764] hover:bg-[#4C1D95] text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-purple-950/20 transition flex items-center justify-center gap-2 text-xs disabled:opacity-60 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>{loginType === 'agent' ? 'Login to Agent Portal' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-5 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="font-bold text-[#3B0764] dark:text-purple-300 block mb-1">
            ⚡ Quick Demo 1-Click Access:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleQuickFill('user', true)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 rounded-lg border border-purple-200 dark:border-slate-700 text-[#4C1D95] dark:text-purple-300 font-semibold transition text-left flex items-center justify-between"
            >
              <span>Passenger: Rahul</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                1-Click ➔
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('agent', true)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 rounded-lg border border-purple-200 dark:border-slate-700 text-[#4C1D95] dark:text-purple-300 font-semibold transition text-left flex items-center justify-between"
            >
              <span>Admin: Vikram</span>
              <span className="text-[10px] text-purple-700 font-bold bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 rounded">
                1-Click ➔
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-purple-50 text-center text-xs text-slate-500">
          {loginType === 'agent' ? (
            <>
              Need partner agency registration?{' '}
              <Link to="/contact" className="font-bold text-[#7E22CE] hover:underline">
                Contact Partner Support
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#7E22CE] hover:underline">
                Register with ₹100 Welcome Bonus
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
