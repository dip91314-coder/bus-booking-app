import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bus,
  User,
  Ticket,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  PhoneCall
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B1B3D] text-white border-b border-slate-800 shadow-sm">
      {/* Utility Bar */}
      <div className="bg-[#07132B] px-4 py-1.5 text-xs text-slate-300 hidden md:block border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-slate-300">
              Pan-India Intercity Bus Booking Platform
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              Customer Support:{' '}
              <a href="tel:18001028787" className="text-white font-medium hover:underline">
                1800-102-8787
              </a>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/help" className="hover:text-white transition flex items-center gap-1.5 text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Help & FAQ</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link to="/contact" className="hover:text-white transition flex items-center gap-1.5 text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Yatra<span className="text-amber-500">Bus</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium -mt-1 hidden sm:block">
                Intercity Bus Travel
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${
                isActive('/') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/buses"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${
                isActive('/buses') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Search Buses
            </Link>
            <Link
              to="/routes"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${
                isActive('/routes') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Routes
            </Link>
            <Link
              to="/destinations"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${
                isActive('/destinations') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Destinations
            </Link>
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${
                isActive('/about') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-1.5 transition font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-medium text-white leading-tight truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role || 'Passenger'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg bg-white text-slate-800 shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 transition font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Passenger Profile
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 transition font-medium"
                    >
                      <Ticket className="w-3.5 h-3.5 text-slate-500" />
                      My Bookings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 transition font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-md shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07132B] border-t border-slate-800 px-4 pt-3 pb-5 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/buses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Search Buses
          </Link>
          <Link
            to="/routes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Routes
          </Link>
          <Link
            to="/destinations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Destinations
          </Link>

          <div className="border-t border-slate-800 my-2 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  My Dashboard ({user.name})
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-amber-400 hover:bg-slate-800"
                  >
                    Admin Operations
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-slate-800 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-slate-950 bg-amber-500 rounded-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
