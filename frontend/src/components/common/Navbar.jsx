import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  X,
  Ticket,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isActive = (path) => {
    if (path === '/popular-trips') {
      return location.pathname === '/popular-trips' || location.pathname === '/routes';
    }
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Bus Tickets', path: '/buses' },
    { label: 'Popular Trips', path: '/popular-trips' },
    { label: 'Short Trips', path: '/destinations' },
    { label: 'Contact Us', path: '/contact' }
  ];

  return (
    <header
      className={`sticky top-0 z-50 h-16 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0D111D]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-slate-800 shadow-soft'
          : 'bg-white dark:bg-[#0D111D] border-b border-[#E5E7EB] dark:border-slate-800'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] rounded-sm transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src="/logo.svg"
            alt="YatraBus"
            className="h-9 w-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.png';
            }}
          />
        </Link>

        {/* Center Nav Links with Animated Underline */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-sm font-medium py-2 transition-colors duration-200 group ${
                isActive(link.path)
                  ? 'text-[#5B21B6] dark:text-purple-400 font-semibold'
                  : 'text-[#475569] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <span>{link.label}</span>
              {/* Animated Underline */}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#5B21B6] dark:bg-purple-400 rounded-full transition-all duration-200 ${
                  isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </Link>
          ))}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark / Light Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-purple-700" aria-hidden="true" />
            )}
          </button>

          <Link
            to="/login"
            className="text-sm font-medium text-[#475569] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white px-2 py-1 transition-colors"
          >
            Agent Login
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5F3FF] dark:bg-purple-950/60 text-[#5B21B6] dark:text-purple-300 px-3.5 py-1.5 rounded-full border border-[#DDD6FE] dark:border-purple-800 hover:bg-[#EDE9FE] dark:hover:bg-purple-900/60 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-[#F8F7FC] dark:bg-slate-800 hover:bg-[#F1F5F9] dark:hover:bg-slate-700 border border-[#E5E7EB] dark:border-slate-700 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full bg-[#5B21B6] flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate text-[#0F172A] dark:text-slate-100">
                  {user?.name || 'Account'}
                </span>
                <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#111622] text-[#0F172A] dark:text-slate-100 shadow-xl border border-[#E5E7EB] dark:border-slate-800 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-[#F1F5F9] dark:border-slate-800">
                    <p className="text-xs text-[#64748B] dark:text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold truncate text-[#0F172A] dark:text-slate-100">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#475569] dark:text-slate-300 hover:bg-[#F8F7FC] dark:hover:bg-slate-800 hover:text-[#5B21B6] dark:hover:text-purple-400 transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-[#5B21B6] dark:text-purple-400" />
                    <span>My Bookings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-[#F1F5F9] dark:border-slate-800 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] rounded-sm transition-all duration-200 shadow-soft hover:-translate-y-0.5 hover:shadow-glow-purple active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-700" />
            )}
          </button>

          {isAuthenticated && (
            <div className="w-8 h-8 rounded-full bg-[#5B21B6] flex items-center justify-center text-xs font-semibold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-sm text-[#475569] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8F7FC] dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0D111D]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-slate-800 shadow-soft px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-[#5B21B6] dark:text-purple-400 font-semibold'
                    : 'text-[#475569] dark:text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#F1F5F9] dark:border-slate-800 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#475569] dark:text-slate-300 py-2"
            >
              Agent Login
            </Link>
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-[#5B21B6] rounded-sm"
              >
                Sign In
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-medium text-rose-600 dark:text-rose-400"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
