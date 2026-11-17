// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const registerMock = vi.hoisted(() => vi.fn());

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ register: registerMock }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import Register from './Register';

const fillForm = (container, email) => {
  const values = {
    name: 'Test Passenger',
    email,
    phone: '9876543210',
    password: 'password123',
    confirmPassword: 'password123',
  };

  Object.entries(values).forEach(([name, value]) => {
    fireEvent.change(container.querySelector(`[name="${name}"]`), {
      target: { value },
    });
  });
};

describe('Register', () => {
  afterEach(cleanup);

  beforeEach(() => {
    registerMock.mockReset().mockResolvedValue({ emailSent: true });
  });

  it('rejects non-Gmail addresses before submitting', async () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fillForm(container, 'rider@example.com');
    fireEvent.click(screen.getByRole('button', { name: /Create Account/ }));

    expect(await screen.findByText('Only @gmail.com addresses can register.')).toBeTruthy();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('accepts Gmail addresses regardless of domain casing', async () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fillForm(container, 'rider@GMAIL.COM');
    fireEvent.click(screen.getByRole('button', { name: /Create Account/ }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Test Passenger',
        email: 'rider@GMAIL.COM',
        phone: '9876543210',
        password: 'password123',
      });
    });
  });
});
