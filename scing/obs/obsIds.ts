export function correlationId(prefix: string = 'corr'): string {
  const r = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now()}_${r}`;
}

export function eventId(prefix: string = 'obs'): string {
  const r = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now()}_${r}`;
}
