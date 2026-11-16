// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationBell from '../components/common/NotificationBell';
import { NotificationProvider, useNotifications } from './NotificationContext';

vi.mock('./AuthContext', () => ({ useAuth: () => ({ isAdmin: false }) }));

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

    const stored = JSON.parse(window.localStorage.getItem('yatrabus_notifications_v1'));
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
});
