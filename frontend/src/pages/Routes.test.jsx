// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RoutesPage from './Routes';

vi.mock('../services/api', () => ({
  routeApi: {
    getRoutes: vi.fn().mockResolvedValue([{
      _id: 'admin-route-1',
      origin: 'Kolkata',
      destination: 'Puducherry',
      distanceKm: 1650,
      estimatedDuration: '32h 00m',
      baseFare: 2100,
      activeBusesCount: 2,
    }]),
  },
}));

describe('RoutesPage', () => {
  it('includes routes created through the admin API', async () => {
    render(
      <MemoryRouter>
        <RoutesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Puducherry')).toBeTruthy();
  });
});
