// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchResults from './SearchResults';

vi.mock('../context/BookingContext', () => ({
  useBooking: () => ({
    buses: [{
      id: 'other-route',
      origin: 'Delhi',
      destination: 'Jaipur',
      busType: 'AC Sleeper',
      fare: 800,
      rating: 4,
      departureTime: '09:00'
    }],
    searchParams: {},
    setSearchParams: vi.fn()
  })
}));

vi.mock('../services/api', () => ({
  tripApi: { searchTrips: vi.fn().mockResolvedValue([]) }
}));

vi.mock('../components/bus/BusCard', () => ({
  default: () => 'BUS_CARD'
}));

describe('SearchResults', () => {
  it('shows the no-scheduled-buses state without listing buses from other routes', async () => {
    render(
      <MemoryRouter initialEntries={['/search?from=Kolkata&to=Manali&date=2026-11-17']}>
        <SearchResults />
      </MemoryRouter>
    );

    expect(await screen.findByText('No Buses Are Scheduled')).toBeTruthy();
    expect(screen.queryByText('BUS_CARD')).toBeNull();
  });
});
