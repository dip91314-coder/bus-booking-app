// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PopularTrips from './PopularTrips';

vi.mock('../services/api', () => ({
  destinationApi: { getDestinations: vi.fn().mockResolvedValue([]) },
  offerApi: { getOffers: vi.fn().mockResolvedValue([]) },
  routeApi: {
    getRoutes: vi.fn().mockResolvedValue([{
      origin: 'Kolkata',
      destination: 'Puducherry',
      distanceKm: 1650,
      estimatedDuration: '32h 00m',
      baseFare: 2100,
      activeBusesCount: 2,
    }]),
  },
}));

vi.mock('../components/common/TravelImage', () => ({
  default: () => null,
}));

describe('PopularTrips', () => {
  it('shows routes created through the admin API in popular routes', async () => {
    render(
      <MemoryRouter>
        <PopularTrips />
      </MemoryRouter>
    );

    expect(await screen.findByText('Puducherry')).toBeTruthy();
  });
});
