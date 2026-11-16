import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { AdminProvider } from './admin/context/AdminContext';
import MainLayout from './layouts/MainLayout';
import { ProtectedRoute, AdminRoute } from './components/common/RouteGuards';
import AppLoadingScreen from './components/common/AppLoadingScreen';
import './App.css';

const Home = React.lazy(() => import('./pages/Home'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));
const SeatSelection = React.lazy(() => import('./pages/SeatSelection'));
const PassengerDetails = React.lazy(() => import('./pages/PassengerDetails'));
const Payment = React.lazy(() => import('./pages/Payment'));
const Confirmation = React.lazy(() => import('./pages/Confirmation'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Destinations = React.lazy(() => import('./pages/Destinations'));
const ShortTrips = React.lazy(() => import('./pages/ShortTrips'));
const RoutesPage = React.lazy(() => import('./pages/Routes'));
const PopularTrips = React.lazy(() => import('./pages/PopularTrips'));
const Help = React.lazy(() => import('./pages/Help'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = React.lazy(() => import('./pages/TermsConditions'));

const AdminLayout = React.lazy(() => import('./admin/layouts/AdminLayout'));
const DashboardPage = React.lazy(() => import('./admin/pages/DashboardPage'));
const BusManagementPage = React.lazy(() => import('./admin/pages/BusManagementPage'));
const RouteManagementPage = React.lazy(() => import('./admin/pages/RouteManagementPage'));
const ScheduleManagementPage = React.lazy(() => import('./admin/pages/ScheduleManagementPage'));
const BookingManagementPage = React.lazy(() => import('./admin/pages/BookingManagementPage'));
const PassengerManagementPage = React.lazy(() => import('./admin/pages/PassengerManagementPage'));
const DriverManagementPage = React.lazy(() => import('./admin/pages/DriverManagementPage'));
const StaffManagementPage = React.lazy(() => import('./admin/pages/StaffManagementPage'));
const PaymentManagementPage = React.lazy(() => import('./admin/pages/PaymentManagementPage'));
const OfferManagementPage = React.lazy(() => import('./admin/pages/OfferManagementPage'));
const ReviewManagementPage = React.lazy(() => import('./admin/pages/ReviewManagementPage'));
const ReportAnalyticsPage = React.lazy(() => import('./admin/pages/ReportAnalyticsPage'));
const NotificationManagementPage = React.lazy(() => import('./admin/pages/NotificationManagementPage'));
const AdminSettingsPage = React.lazy(() => import('./admin/pages/AdminSettingsPage'));
const PricingManagementPage = React.lazy(() => import('./admin/pages/PricingManagementPage'));
const DestinationManagementPage = React.lazy(() => import('./admin/pages/DestinationManagementPage'));
const PackageManagementPage = React.lazy(() => import('./admin/pages/PackageManagementPage'));
const AuditLogPage = React.lazy(() => import('./admin/pages/AuditLogPage'));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BookingProvider>
            <React.Suspense fallback={<AppLoadingScreen message="Connecting India's Journeys..." />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="buses" element={<SearchResults />} />
                  <Route path="search" element={<SearchResults />} />
                  <Route path="bus/:id/seats" element={<SeatSelection />} />
                  <Route path="booking/seats/:id" element={<SeatSelection />} />
                  <Route path="booking/passengers" element={<ProtectedRoute><PassengerDetails /></ProtectedRoute>} />
                  <Route path="booking/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                  <Route path="booking/confirmation/:id" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
                  <Route path="ticket/:id" element={<Confirmation />} />

                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />

                  <Route path="dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                  <Route path="my-bookings" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="destinations" element={<Destinations />} />
                  <Route path="short-trips" element={<ShortTrips />} />
                  <Route path="routes" element={<PopularTrips />} />
                  <Route path="popular-trips" element={<PopularTrips />} />
                  <Route path="help" element={<Help />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms-and-conditions" element={<TermsConditions />} />
                </Route>

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminProvider>
                        <AdminLayout />
                      </AdminProvider>
                    </AdminRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="buses" element={<BusManagementPage />} />
                  <Route path="routes" element={<RouteManagementPage />} />
                  <Route path="schedules" element={<ScheduleManagementPage />} />
                  <Route path="pricing" element={<PricingManagementPage />} />
                  <Route path="destinations" element={<DestinationManagementPage />} />
                  <Route path="packages" element={<PackageManagementPage />} />
                  <Route path="bookings" element={<BookingManagementPage />} />
                  <Route path="passengers" element={<PassengerManagementPage />} />
                  <Route path="drivers" element={<DriverManagementPage />} />
                  <Route path="staff" element={<StaffManagementPage />} />
                  <Route path="payments" element={<PaymentManagementPage />} />
                  <Route path="offers" element={<OfferManagementPage />} />
                  <Route path="reviews" element={<ReviewManagementPage />} />
                  <Route path="reports" element={<ReportAnalyticsPage />} />
                  <Route path="notifications" element={<NotificationManagementPage />} />
                  <Route path="audit-logs" element={<AuditLogPage />} />
                  <Route path="audit-log" element={<AuditLogPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </BookingProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
