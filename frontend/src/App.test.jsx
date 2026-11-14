import { describe, it, expect } from 'vitest';
import { POPULAR_CITIES, MOCK_BUSES, POPULAR_ROUTES } from './data/mockData';
import { getAvailableSeatCount, normalizeYatraFleetItem } from './utils/yatraFleet';

describe('YatraBus Data and Routing Integrity', () => {
  it('contains pan-India popular cities with coordinates', () => {
    expect(POPULAR_CITIES.length).toBeGreaterThan(10);
    const kolkata = POPULAR_CITIES.find((c) => c.name === 'Kolkata');
    expect(kolkata).toBeDefined();
    expect(kolkata?.lat).toBeCloseTo(22.57, 1);
  });

  it('contains comprehensive interstate bus fleet with seat models', () => {
    expect(MOCK_BUSES.length).toBeGreaterThan(5);
    expect(MOCK_BUSES.every((bus) => bus.operator === 'YatraBus')).toBe(true);
    const bus = MOCK_BUSES[0];
    expect(bus.busNumber).toBeDefined();
    expect(bus.seats?.lower).toBeDefined();
    expect(bus.boardingPoints?.length).toBeGreaterThan(0);
    expect(bus.droppingPoints?.length).toBeGreaterThan(0);
  });

  it('converts saved or remote bus brands to the single YatraBus fleet', () => {
    expect(normalizeYatraFleetItem({
      operator: 'Legacy Operator',
      busName: 'Legacy Fleet Coach',
      busType: 'AC Sleeper (2+1)'
    })).toMatchObject({
      operator: 'YatraBus',
      busName: 'YatraBus AC Sleeper'
    });
  });

  it('uses explicit live availability or counts available seats when needed', () => {
    expect(getAvailableSeatCount({ availableSeatsCount: 0, seats: { lower: [{ status: 'available' }] } })).toBe(0);
    expect(getAvailableSeatCount({
      seats: {
        lower: [{ status: 'available' }, { status: 'booked' }],
        upper: [{ status: 'AVAILABLE' }]
      }
    })).toBe(2);
  });

  it('contains high-frequency route definitions', () => {
    expect(POPULAR_ROUTES.length).toBeGreaterThan(5);
  });
});
