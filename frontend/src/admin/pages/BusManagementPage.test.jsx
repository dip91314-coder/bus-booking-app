// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const adminState = vi.hoisted(() => ({
  buses: [],
  addBus: vi.fn(),
  updateBus: vi.fn(),
  deleteBus: vi.fn(),
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}));

vi.mock('../context/AdminContext', () => ({ useAdmin: () => adminState }));
import BusManagementPage from './BusManagementPage';

const openAddBusForm = () => {
  render(
    <MemoryRouter>
      <BusManagementPage />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add New Bus' }));
  fireEvent.change(screen.getByPlaceholderText('e.g. WB-02-TC-9988'), {
    target: { value: 'WB-04-E-9988' },
  });
  fireEvent.change(screen.getByPlaceholderText('e.g. YatraBus Royal Star Sleeper'), {
    target: { value: 'YatraBus Test Sleeper' },
  });
};

describe('BusManagementPage add form', () => {
  beforeEach(() => {
    adminState.buses = [];
    adminState.addBus.mockReset();
    adminState.updateBus.mockReset();
    adminState.deleteBus.mockReset();
    adminState.addBus.mockResolvedValue({ id: 'bus-1', busNumber: 'WB-04-E-9988' });
  });

  afterEach(cleanup);

  it('keeps the form actions visible and saves once on submit', async () => {
    openAddBusForm();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    const saveButton = screen.getByRole('button', { name: 'Save Bus' });
    expect(saveButton).toBeTruthy();

    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(adminState.addBus).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Bus Fleet Management')).toBeTruthy();
  });

  it('rejects identical origin and destination before saving', async () => {
    openAddBusForm();
    const originInput = screen.getByDisplayValue('Kolkata');
    const destinationInput = screen.getByDisplayValue('Siliguri');
    fireEvent.change(originInput, { target: { value: 'Kolkata' } });
    fireEvent.change(destinationInput, { target: { value: 'kolkata' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Bus' }));

    expect(adminState.addBus).not.toHaveBeenCalled();
    expect(await screen.findByText('Origin and destination must be different')).toBeTruthy();
  });
});
