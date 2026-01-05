import { runReadiness } from '../../scing/lari/readiness/runReadiness';

describe('LARI readiness', () => {
  it('passes readiness gates', () => {
    const r = runReadiness('2025-01-01T00:00:00.000Z');
    expect(r.ready).toBe(true);
    expect(r.failures).toEqual([]);
  });
});
