export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [k: string]: JsonValue };
export type JsonArray = JsonValue[];

export type UnknownRecord = Record<string, unknown>;

export function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function getRecord(v: unknown, ctx = 'value'): UnknownRecord {
  if (!isRecord(v)) throw new Error(`${ctx} must be an object`);
  return v;
}

export function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

export function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function asBoolean(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}
