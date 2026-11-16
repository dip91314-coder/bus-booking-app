// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationBell from '../components/common/NotificationBell';
import { NotificationProvider, useNotifications } from './NotificationContext';

const authState = vi.hoisted(() => ({ user: null }));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ isAdmin: authState.user?.role === 'admin', user: authState.user }),
}));
vi.mock('../services/api', () => ({
  notificationApi: {
    getMyNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));
import { notificationApi } from '../services/api';

const storage = new Map();
const localStorageMock = {
  getItem: vi.fn((key) => storage.get(key) ?? null),
  setItem: vi.fn((key, value) => storage.set(key, String(value))),
  removeItem: vi.fn((key) => storage.delete(key)),
  clear: vi.fn(() => storage.clear()),
};

const NotificationHarness = () => {
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead } = useNotifications();
  return (
    <div>
      <button
        type="button"
        onClick={() => addNotification({
          title: 'Booking created',
          message: 'BK-TEST is confirmed.',
          type: 'booking'
        })}
      >
        Add notification
      </button>
      <button type="button" onClick={() => markAsRead(notifications[0]?.id)}>
        Mark newest read
      </button>
      <button type="button" onClick={markAllAsRead}>
        Mark all read
      </button>
      <output data-testid="unread-count">{unreadCount}</output>
    </div>
  );
};

describe('NotificationContext', () => {
  afterEach(cleanup);

  beforeEach(() => {
    storage.clear();
    authState.user = null;
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorageMock,
    });
  });

  it('stores typed notifications newest-first and supports read actions', () => {
    render(
      <MemoryRouter>
        <NotificationProvider>
          <NotificationHarness />
          <NotificationBell />
        </NotificationProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add notification' }));
    expect(screen.getByTestId('unread-count').textContent).toBe('1');

    const stored = JSON.parse(window.localStorage.getItem('yatrabus_notifications_v1:guest'));
    expect(stored[0]).toMatchObject({
      title: 'Booking created',
      message: 'BK-TEST is confirmed.',
      type: 'booking',
      is_read: false,
    });
    expect(stored[0].created_at).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Mark newest read' }));
    expect(screen.getByTestId('unread-count').textContent).toBe('0');
  });

  it('shows the empty state and allows marking all notifications read', () => {
    render(
      <MemoryRouter>
        <NotificationProvider>
          <NotificationHarness />
          <NotificationBell />
        </NotificationProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(screen.getByText('No notifications')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Add notification' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
    expect(screen.getByTestId('unread-count').textContent).toBe('0');
  });

  it('continues working when browser local storage is unavailable', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: undefined,
    });

    render(
      <MemoryRouter>
        <NotificationProvider>
          <NotificationHarness />
        </NotificationProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add notification' }));
    expect(screen.getByTestId('unread-count').textContent).toBe('1');
    expect(notificationApi.getMyNotifications).not.toHaveBeenCalled();
  });

  it('loads customer notifications from the API and persists read state on the server', async () => {
    authState.user = { id: 'customer-1', email: 'customer@example.com', role: 'user' };
    window.localStorage.setItem('yatrabus_token', 'customer-token');
    notificationApi.getMyNotifications.mockResolvedValue([{
      _id: 'notice-1',
      title: 'Schedule update',
      message: 'Your bus departure is now 8:30 PM.',
      category: 'alert',
      isRead: false,
      createdAt: '2026-11-16T10:00:00.000Z',
    }]);
    notificationApi.markAsRead.mockResolvedValue({ isRead: true });

    render(
      <MemoryRouter>
        <NotificationProvider>
          <NotificationBell />
        </NotificationProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(await screen.findByText('Your bus departure is now 8:30 PM.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    await waitFor(() => expect(notificationApi.markAsRead).toHaveBeenCalledWith('notice-1'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Notifications' })).toBeTruthy());
  });
});
