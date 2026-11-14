export function normalizeYatraBus(bus) {
  if (!bus || typeof bus !== 'object') return bus;

  const value = typeof bus.toObject === 'function' ? bus.toObject() : bus;
  const suppliedName = typeof value.busName === 'string' ? value.busName : '';
  const nameHasBrand = /^YatraBus(?:\s|$)/i.test(suppliedName);
  const normalizedName = nameHasBrand
    ? `YatraBus${suppliedName.slice(8)}`
    : `YatraBus ${value.busType || 'Coach'}`;

  return {
    ...value,
    operator: 'YatraBus',
    busName: normalizedName,
  };
}
