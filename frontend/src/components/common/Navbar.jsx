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
  ChevronDown
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm transition">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="YatraBus Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B0764] to-[#7E22CE] items-center justify-center text-white shadow-md">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-extrabold tracking-tight text-[#3B0764] font-sans">
                Yatra<span className="text-[#7E22CE]">Bus</span>
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              to="/buses"
              className={`text-sm font-semibold transition hover:text-[#7E22CE] ${
                isActive('/buses') ? 'text-[#7E22CE]' : 'text-slate-600'
              }`}
            >
              Bus Ticket
            </Link>
            <Link
              to="/routes"
              className={`text-sm font-semibold transition hover:text-[#7E22CE] ${
                isActive('/routes') ? 'text-[#7E22CE]' : 'text-slate-600'
              }`}
            >
              Popular Trip
            </Link>
            <Link
              to="/destinations"
              className={`text-sm font-semibold transition hover:text-[#7E22CE] ${
                isActive('/destinations') ? 'text-[#7E22CE]' : 'text-slate-600'
              }`}
            >
              Short Trip
            </Link>
            <Link
              to="/help"
              className={`text-sm font-semibold transition hover:text-[#7E22CE] ${
                isActive('/help') ? 'text-[#7E22CE]' : 'text-slate-600'
              }`}
            >
              Bus Format
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-semibold transition hover:text-[#7E22CE] ${
                isActive('/contact') ? 'text-[#7E22CE]' : 'text-slate-600'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-[#7E22CE] px-3 py-2 rounded-lg transition"
            >
              Agent Login
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs bg-purple-50 hover:bg-purple-100 text-[#4C1D95] px-3.5 py-2 rounded-xl border border-purple-200 flex items-center gap-1.5 transition font-bold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#7E22CE]" />
                <span>Admin</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100/80 border border-purple-100 px-3 py-2 rounded-xl transition"
                >
                  <div className="w-7 h-7 rounded-full bg-[#3B0764] flex items-center justify-center text-xs font-bold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user.name}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white text-slate-800 shadow-2xl border border-purple-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-purple-50">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#7E22CE] transition"
                    >
                      <Ticket className="w-4 h-4 text-[#7E22CE]" />
                      <span>My Bookings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition border-t border-purple-50 mt-1"
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
                className="text-xs font-bold bg-[#3B0764] hover:bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl shadow-md shadow-purple-900/20 transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-purple-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#3B0764]" /> : <Menu className="w-6 h-6 text-[#3B0764]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-purple-100 px-4 pt-3 pb-5 space-y-1">
          <Link
            to="/buses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7E22CE]"
          >
            Bus Ticket
          </Link>
          <Link
            to="/routes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7E22CE]"
          >
            Popular Trip
          </Link>
          <Link
            to="/destinations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7E22CE]"
          >
            Short Trip
          </Link>
          <Link
            to="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7E22CE]"
          >
            Bus Format
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7E22CE]"
          >
            Contact Us
          </Link>

          <div className="border-t border-purple-100 my-2 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-slate-800"
                >
                  My Dashboard ({user.name})
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold text-[#7E22CE]"
                  >
                    Admin Operations
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-bold text-[#3B0764] bg-purple-50 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-bold text-white bg-[#3B0764] rounded-xl"
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
