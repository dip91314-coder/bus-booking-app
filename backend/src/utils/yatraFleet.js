export function normalizeYatraBus(bus) {
  if (!bus || typeof bus !== 'object') return bus;

  const value = typeof bus.toObject === 'function' ? bus.toObject() : bus;
  const operator = value.operator || 'YatraBus';
  const suppliedName = typeof value.busName === 'string' ? value.busName : '';
  const nameHasBrand = /^YatraBus(?:\s|$)/i.test(suppliedName);
  const normalizedName = suppliedName
    ? suppliedName
    : nameHasBrand
    ? `YatraBus${suppliedName.slice(8)}`
    : `${operator} ${value.busType || 'Coach'}`;

  const rawId = value._id ? value._id.toString() : value.id;
  const pnr = value.pnr || value.bookingReference || rawId || '';
  const bookingReference = value.bookingReference || value.pnr || pnr;

  return {
    ...value,
    id: rawId || pnr,
    pnr,
    bookingReference,
    operator,
    busName: normalizedName,
  };
}
