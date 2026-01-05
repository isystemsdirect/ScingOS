import { redact } from '../../scing/obs/obsRedact';

test('redact removes tokens', () => {
  const x = redact({ token: 'abc', nested: { authorization: 'Bearer SECRET' }, ok: 1 });
  expect(x.token).toBe('[REDACTED]');
  expect(x.nested.authorization).toContain('[REDACTED]');
  expect(x.ok).toBe(1);
});
