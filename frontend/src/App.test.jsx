import { describe, it, expect } from 'vitest';
import { POPULAR_CITIES, MOCK_BUSES, POPULAR_ROUTES } from './data/mockData';

describe('YatraBus Data and Routing Integrity', () => {
  it('contains pan-India popular cities with coordinates', () => {
    expect(POPULAR_CITIES.length).toBeGreaterThan(10);
    const kolkata = POPULAR_CITIES.find((c) => c.name === 'Kolkata');
    expect(kolkata).toBeDefined();
    expect(kolkata?.lat).toBeCloseTo(22.57, 1);
  });

  it('contains comprehensive interstate bus fleet with seat models', () => {
    expect(MOCK_BUSES.length).toBeGreaterThan(5);
    const bus = MOCK_BUSES[0];
    expect(bus.busNumber).toBeDefined();
    expect(bus.seats?.lower).toBeDefined();
    expect(bus.boardingPoints?.length).toBeGreaterThan(0);
    expect(bus.droppingPoints?.length).toBeGreaterThan(0);
  });

  it('contains high-frequency route definitions', () => {
    expect(POPULAR_ROUTES.length).toBeGreaterThan(5);
  });
});
