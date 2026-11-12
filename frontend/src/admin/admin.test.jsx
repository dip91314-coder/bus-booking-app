import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import {
  INITIAL_BUSES,
  INITIAL_ROUTES,
  INITIAL_SCHEDULES,
  INITIAL_BOOKINGS,
  INITIAL_PASSENGERS,
  INITIAL_DRIVERS,
  INITIAL_STAFF,
  INITIAL_PAYMENTS,
  INITIAL_OFFERS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS
} from './data/mockAdminData';
import DashboardPage from './pages/DashboardPage';
import BusManagementPage from './pages/BusManagementPage';
import RouteManagementPage from './pages/RouteManagementPage';
import ScheduleManagementPage from './pages/ScheduleManagementPage';
import BookingManagementPage from './pages/BookingManagementPage';
import PassengerManagementPage from './pages/PassengerManagementPage';
import DriverManagementPage from './pages/DriverManagementPage';
import StaffManagementPage from './pages/StaffManagementPage';
import PaymentManagementPage from './pages/PaymentManagementPage';
import OfferManagementPage from './pages/OfferManagementPage';
import ReviewManagementPage from './pages/ReviewManagementPage';
import ReportAnalyticsPage from './pages/ReportAnalyticsPage';
import NotificationManagementPage from './pages/NotificationManagementPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

describe('Admin Panel Data & Module Integrity', () => {
  it('contains comprehensive mock fleet, routes, schedules and bookings', () => {
    expect(INITIAL_BUSES.length).toBeGreaterThanOrEqual(5);
    expect(INITIAL_ROUTES.length).toBeGreaterThanOrEqual(5);
    expect(INITIAL_SCHEDULES.length).toBeGreaterThanOrEqual(4);
    expect(INITIAL_BOOKINGS.length).toBeGreaterThanOrEqual(5);
    expect(INITIAL_PASSENGERS.length).toBeGreaterThanOrEqual(5);
    expect(INITIAL_DRIVERS.length).toBeGreaterThanOrEqual(4);
    expect(INITIAL_STAFF.length).toBeGreaterThanOrEqual(4);
    expect(INITIAL_PAYMENTS.length).toBeGreaterThanOrEqual(5);
    expect(INITIAL_OFFERS.length).toBeGreaterThanOrEqual(3);
    expect(INITIAL_REVIEWS.length).toBeGreaterThanOrEqual(4);
    expect(INITIAL_NOTIFICATIONS.length).toBeGreaterThanOrEqual(4);
  });

  it('renders all 14 admin pages without crashing', () => {
    const pages = [
      { name: 'DashboardPage', component: <DashboardPage /> },
      { name: 'BusManagementPage', component: <BusManagementPage /> },
      { name: 'RouteManagementPage', component: <RouteManagementPage /> },
      { name: 'ScheduleManagementPage', component: <ScheduleManagementPage /> },
      { name: 'BookingManagementPage', component: <BookingManagementPage /> },
      { name: 'PassengerManagementPage', component: <PassengerManagementPage /> },
      { name: 'DriverManagementPage', component: <DriverManagementPage /> },
      { name: 'StaffManagementPage', component: <StaffManagementPage /> },
      { name: 'PaymentManagementPage', component: <PaymentManagementPage /> },
      { name: 'OfferManagementPage', component: <OfferManagementPage /> },
      { name: 'ReviewManagementPage', component: <ReviewManagementPage /> },
      { name: 'ReportAnalyticsPage', component: <ReportAnalyticsPage /> },
      { name: 'NotificationManagementPage', component: <NotificationManagementPage /> },
      { name: 'AdminSettingsPage', component: <AdminSettingsPage /> }
    ];

    pages.forEach(({ name, component }) => {
      const html = renderToString(
        <MemoryRouter>
          <AdminProvider>{component}</AdminProvider>
        </MemoryRouter>
      );
      expect(html.length, `Expected ${name} to render HTML`).toBeGreaterThan(100);
    });
  });
});
