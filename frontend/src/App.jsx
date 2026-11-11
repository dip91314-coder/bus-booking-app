import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Destinations from './pages/Destinations';
import RoutesPage from './pages/Routes';
import Help from './pages/Help';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="buses" element={<SearchResults />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="bus/:id/seats" element={<SeatSelection />} />
              <Route path="booking/seats/:id" element={<SeatSelection />} />
              <Route path="booking/passengers" element={<PassengerDetails />} />
              <Route path="booking/payment" element={<Payment />} />
              <Route path="booking/confirmation/:id" element={<Confirmation />} />
              <Route path="ticket/:id" element={<Confirmation />} />

              {/* Authentication */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />

              {/* User Account */}
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="my-bookings" element={<UserDashboard />} />
              <Route path="profile" element={<UserDashboard />} />

              {/* Admin Portal */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/buses" element={<AdminDashboard />} />
              <Route path="admin/bookings" element={<AdminDashboard />} />

              {/* Information & Policies */}
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="destinations" element={<Destinations />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="help" element={<Help />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-and-conditions" element={<TermsConditions />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
