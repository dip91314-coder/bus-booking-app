import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import MainLayout from './layouts/MainLayout';

// Customer Pages
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
import About from './pages/About';
import Contact from './pages/Contact';
import Destinations from './pages/Destinations';
import RoutesPage from './pages/Routes';
import PopularTrips from './pages/PopularTrips';
import Help from './pages/Help';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

// Admin Panel Architecture
import { AdminProvider } from './admin/context/AdminContext';
import AdminLayout from './admin/layouts/AdminLayout';
import DashboardPage from './admin/pages/DashboardPage';
import BusManagementPage from './admin/pages/BusManagementPage';
import RouteManagementPage from './admin/pages/RouteManagementPage';
import ScheduleManagementPage from './admin/pages/ScheduleManagementPage';
import BookingManagementPage from './admin/pages/BookingManagementPage';
import PassengerManagementPage from './admin/pages/PassengerManagementPage';
import DriverManagementPage from './admin/pages/DriverManagementPage';
import StaffManagementPage from './admin/pages/StaffManagementPage';
import PaymentManagementPage from './admin/pages/PaymentManagementPage';
import OfferManagementPage from './admin/pages/OfferManagementPage';
import ReviewManagementPage from './admin/pages/ReviewManagementPage';
import ReportAnalyticsPage from './admin/pages/ReportAnalyticsPage';
import NotificationManagementPage from './admin/pages/NotificationManagementPage';
import AdminSettingsPage from './admin/pages/AdminSettingsPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BookingProvider>
            <Routes>
            {/* Customer Storefront with MainLayout */}
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

              {/* Information & Policies */}
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="destinations" element={<Destinations />} />
              <Route path="routes" element={<PopularTrips />} />
              <Route path="popular-trips" element={<PopularTrips />} />
              <Route path="help" element={<Help />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-and-conditions" element={<TermsConditions />} />
            </Route>

            {/* Enterprise Admin Panel Suite with Dedicated SaaS Layout */}
            <Route
              path="/admin"
              element={
                <AdminProvider>
                  <AdminLayout />
                </AdminProvider>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="buses" element={<BusManagementPage />} />
              <Route path="routes" element={<RouteManagementPage />} />
              <Route path="schedules" element={<ScheduleManagementPage />} />
              <Route path="bookings" element={<BookingManagementPage />} />
              <Route path="passengers" element={<PassengerManagementPage />} />
              <Route path="drivers" element={<DriverManagementPage />} />
              <Route path="staff" element={<StaffManagementPage />} />
              <Route path="payments" element={<PaymentManagementPage />} />
              <Route path="offers" element={<OfferManagementPage />} />
              <Route path="reviews" element={<ReviewManagementPage />} />
              <Route path="reports" element={<ReportAnalyticsPage />} />
              <Route path="notifications" element={<NotificationManagementPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BookingProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
