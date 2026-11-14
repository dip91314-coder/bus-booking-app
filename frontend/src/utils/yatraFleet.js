const getFleetLabel = (busType) => {
  const type = typeof busType === 'string' ? busType.replace(/\s*\([^)]*\)\s*$/, '').trim() : '';
  return `YatraBus ${type || 'Coach'}`;
};

export const normalizeYatraFleetItem = (item) => {
  if (!item || typeof item !== 'object') return item;

  const busName = typeof item.busName === 'string' && /^YatraBus(?:\s|$)/.test(item.busName)
    ? item.busName
    : getFleetLabel(item.busType);

  return {
    ...item,
    operator: 'YatraBus',
    ...(item.busName ? { busName } : {})
  };
};

export const normalizeYatraFleetItems = (items) =>
  Array.isArray(items) ? items.map(normalizeYatraFleetItem) : items;

export const getAvailableSeatCount = (item) => {
  const explicitCount = item?.availableSeats ?? item?.availableSeatsCount;
  if (explicitCount !== null && explicitCount !== undefined && explicitCount !== '') {
    const count = Number(explicitCount);
    return Number.isFinite(count) ? Math.max(0, count) : 0;
  }

  const seats = [...(item?.seats?.lower || []), ...(item?.seats?.upper || [])];
  return seats.filter((seat) => seat.status?.toLowerCase() === 'available').length;
};
