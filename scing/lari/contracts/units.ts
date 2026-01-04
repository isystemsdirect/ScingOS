export type QuantityKind =
  | 'length'
  | 'angle'
  | 'temperature'
  | 'voltage'
  | 'mass'
  | 'percent'
  | 'ratio'
  | 'count'
  | 'bool'
  | 'unknown';

export type UnitId =
  | 'm'
  | 'cm'
  | 'mm'
  | 'in'
  | 'ft'
  | 'deg'
  | 'C'
  | 'F'
  | 'K'
  | 'v'
  | 'kg'
  | 'g'
  | 'lb'
  | 'pct'
  | '%'
  | '1'
  | 'count'
  | 'bool';

const UNIT_KIND: Record<UnitId, QuantityKind> = {
  m: 'length',
  cm: 'length',
  mm: 'length',
  in: 'length',
  ft: 'length',
  deg: 'angle',

  C: 'temperature',
  F: 'temperature',
  K: 'temperature',

  v: 'voltage',

  kg: 'mass',
  g: 'mass',
  lb: 'mass',

  pct: 'percent',
  '%': 'percent',
  '1': 'ratio',
  count: 'count',
  bool: 'bool',
};

export function isKnownUnit(unit: string): unit is UnitId {
  return unit in UNIT_KIND;
}

export function unitKind(unit: UnitId): QuantityKind {
  return UNIT_KIND[unit] ?? 'unknown';
}

export function areUnitsCompatible(a: UnitId, b: UnitId): boolean {
  return unitKind(a) === unitKind(b);
}

export function convertValue(params: { value: number; from: UnitId; to: UnitId }): number {
  const { value, from, to } = params;

  if (!Number.isFinite(value)) throw new Error('NON_FINITE_VALUE');
  if (from === to) return value;
  if (!areUnitsCompatible(from, to)) throw new Error('INCOMPATIBLE_UNITS');

  const kind = unitKind(from);
  if (kind === 'length') {
    const toMeters = (v: number, u: UnitId): number => {
      if (u === 'm') return v;
      if (u === 'cm') return v / 100;
      if (u === 'mm') return v / 1000;
      if (u === 'in') return v * 0.0254;
      if (u === 'ft') return v * 0.3048;
      throw new Error('UNSUPPORTED_LENGTH_UNIT');
    };

    const fromMeters = (m: number, u: UnitId): number => {
      if (u === 'm') return m;
      if (u === 'cm') return m * 100;
      if (u === 'mm') return m * 1000;
      if (u === 'in') return m / 0.0254;
      if (u === 'ft') return m / 0.3048;
      throw new Error('UNSUPPORTED_LENGTH_UNIT');
    };

    return fromMeters(toMeters(value, from), to);
  }

  if (kind === 'temperature') {
    const toKelvin = (v: number, u: UnitId): number => {
      if (u === 'K') return v;
      if (u === 'C') return v + 273.15;
      if (u === 'F') return ((v - 32) * 5) / 9 + 273.15;
      throw new Error('UNSUPPORTED_TEMPERATURE_UNIT');
    };

    const fromKelvin = (k: number, u: UnitId): number => {
      if (u === 'K') return k;
      if (u === 'C') return k - 273.15;
      if (u === 'F') return ((k - 273.15) * 9) / 5 + 32;
      throw new Error('UNSUPPORTED_TEMPERATURE_UNIT');
    };

    return fromKelvin(toKelvin(value, from), to);
  }

  if (kind === 'mass') {
    const toKg = (v: number, u: UnitId): number => {
      if (u === 'kg') return v;
      if (u === 'g') return v / 1000;
      if (u === 'lb') return v * 0.45359237;
      throw new Error('UNSUPPORTED_MASS_UNIT');
    };

    const fromKg = (kg: number, u: UnitId): number => {
      if (u === 'kg') return kg;
      if (u === 'g') return kg * 1000;
      if (u === 'lb') return kg / 0.45359237;
      throw new Error('UNSUPPORTED_MASS_UNIT');
    };

    return fromKg(toKg(value, from), to);
  }

  // % / ratio / count only convert to itself
  throw new Error('UNSUPPORTED_CONVERSION');
}
