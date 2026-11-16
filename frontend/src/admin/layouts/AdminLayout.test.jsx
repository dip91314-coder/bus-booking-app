// @vitest-environment jsdom

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationProvider } from '../../context/NotificationContext';

vi.mock('../context/AdminContext', () => ({ useAdmin: vi.fn() }));
vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../context/ThemeContext', () => ({ useTheme: vi.fn() }));
vi.mock('../../components/common/ApiHealthBadge', () => ({ default: () => null }));

describe('AdminLayout account identity', () => {
  beforeEach(() => {
    useAdmin.mockReturnValue({
      notifications: [],
      unreadNotificationsCount: 0,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });
    useAuth.mockReturnValue({
      user: {
        name: 'Nadia Khan',
        email: 'nadia@example.com',
        role: 'admin',
      },
      logout: vi.fn(),
    });
    useTheme.mockReturnValue({ isDark: false, toggleTheme: vi.fn() });
  });

  it('shows the signed-in admin instead of a platform-wide profile', () => {
    render(
      <MemoryRouter>
        <NotificationProvider>
          <AdminLayout />
        </NotificationProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Nadia Khan')).toBeTruthy();
    expect(screen.queryByText('Vikram Das')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Nadia Khan/ }));
    expect(screen.getByText('nadia@example.com')).toBeTruthy();
  });
});
