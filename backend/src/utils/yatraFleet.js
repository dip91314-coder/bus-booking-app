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

  return {
    ...value,
    operator,
    busName: normalizedName,
  };
}
