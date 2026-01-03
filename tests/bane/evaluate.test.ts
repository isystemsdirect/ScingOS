import { evaluateEntitlement } from '../../scing/bane/baneEntitlements';
import { makeSnapshot } from './fixtures';

test('offline allows stage A when snapshot valid', () => {
  const snap = makeSnapshot();
  const d = evaluateEntitlement({
    authUid: 'u1',
    orgId: 'o1',
    key: 'vision',
    requiredStage: 'A',
    online: false,
    snapshot: snap,
    requiresExternalHardware: false,
    requiresPhysicalControl: false,
  });
  expect(d.allow).toBe(true);
});

test('offline denies external hardware by constraint', () => {
  const snap = makeSnapshot();
  const d = evaluateEntitlement({
    authUid: 'u1',
    orgId: 'o1',
    key: 'vision',
    requiredStage: 'B',
    online: false,
    snapshot: snap,
    requiresExternalHardware: true,
  });
  expect(d.allow).toBe(false);
  expect(d.reason).toBe('OFFLINE_DENY_EXTERNAL');
});
