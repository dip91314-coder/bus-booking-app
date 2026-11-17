const getFleetLabel = (busType) => {
  const type = typeof busType === 'string' ? busType.replace(/\s*\([^)]*\)\s*$/, '').trim() : '';
  return `YatraBus ${type || 'Coach'}`;
};

export const normalizeYatraFleetItem = (item) => {
  if (!item || typeof item !== 'object') return item;

  const isLegacy = item.operator === 'Legacy Operator' || item.operator === 'BharatBus';
  const operator = isLegacy ? 'YatraBus' : (item.operator || 'YatraBus');
  const busName = (isLegacy && item.busName === 'Legacy Fleet Coach')
    ? getFleetLabel(item.busType)
    : (typeof item.busName === 'string' && /^YatraBus(?:\s|$)/.test(item.busName)
        ? item.busName
        : (item.busName || getFleetLabel(item.busType)));

  const pnr = item.pnr || item.bookingReference || item.id || item._id || '';
  const bookingReference = item.bookingReference || item.pnr || pnr;
  const id = item.id || item._id || pnr;

  return {
    ...item,
    id,
    pnr,
    bookingReference,
    operator,
    ...(busName ? { busName } : {})
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
