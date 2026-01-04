import { getDomain } from '../../scing/domains/domainRegistry';

test('moisture domain exists', () => {
  const d = getDomain('moisture_mold');
  expect(d).toBeTruthy();
  expect(d.requiredMeasurements.length).toBeGreaterThan(0);
});
