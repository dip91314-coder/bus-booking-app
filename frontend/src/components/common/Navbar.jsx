import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  Ticket,
  LogOut,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

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
    { label: 'Popular Trips', path: '/routes' },
    { label: 'Short Trips', path: '/destinations' },
    { label: 'Contact Us', path: '/contact' }
  ];

  return (
    <header
      className={`sticky top-0 z-50 h-16 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-soft'
          : 'bg-white border-b border-[#E5E7EB]'
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

        {/* Center / Right Nav Links with Animated Underline */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-sm font-medium py-2 transition-colors duration-200 group ${
                isActive(link.path) ? 'text-[#5B21B6]' : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <span>{link.label}</span>
              {/* Animated Underline */}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#5B21B6] rounded-full transition-all duration-200 ${
                  isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </Link>
          ))}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-[#475569] hover:text-[#0F172A] px-2 py-1 transition-colors"
          >
            Agent Login
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5F3FF] text-[#5B21B6] px-3.5 py-1.5 rounded-full border border-[#DDD6FE] hover:bg-[#EDE9FE] transition-colors"
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
                className="flex items-center gap-2 bg-[#F8F7FC] hover:bg-[#F1F5F9] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full bg-[#5B21B6] flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate text-[#0F172A]">
                  {user?.name || 'Account'}
                </span>
                <ChevronDown className="w-4 h-4 text-[#64748B]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-md bg-white text-[#0F172A] shadow-soft border border-[#E5E7EB] py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-[#F1F5F9]">
                    <p className="text-xs text-[#64748B]">Signed in as</p>
                    <p className="text-xs font-semibold truncate text-[#0F172A]">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#475569] hover:bg-[#F8F7FC] hover:text-[#5B21B6] transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-[#5B21B6]" />
                    <span>My Bookings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors border-t border-[#F1F5F9] mt-1"
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
          {isAuthenticated && (
            <div className="w-8 h-8 rounded-full bg-[#5B21B6] flex items-center justify-center text-xs font-semibold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-sm text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F7FC] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-soft px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'text-[#5B21B6] font-semibold' : 'text-[#475569]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#F1F5F9] flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#475569] py-2"
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
                className="w-full text-left py-2 text-sm font-medium text-rose-600"
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
