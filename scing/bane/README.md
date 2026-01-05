# BANE

BANE provides a conservative, deterministic policy guard for text/tool requests.

## Profile

- `bane_fog_v1`: strict mode, default deny, escalation enabled.

## Usage

```ts
import { createLiveBaneEngine } from './runtime/liveBaneEngine';

const engine = createLiveBaneEngine({ profileId: 'bane_fog_v1' });
const out = engine.evaluate({
  text: '...',
  req: {
    route: 'http:/api/example',
    requiredCapability: 'bane:invoke',
    auth: {
      identityId: 'user_123',
      capabilities: ['bane:invoke'],
      sessionIntegrity: { nonceOk: true, signatureOk: true, tokenFresh: true },
    },
  },
});
```

## Integrations

- HTTP guard: `makeBaneHttpGuard(config)`
- Tool guard: `makeBaneToolGuard(config)`

## Persistence

BANE supports optional persistence via a `BaneStore` implementation. See storage helpers.

## Safety Notes

BANE responses are intentionally generic and must not include detector details or bypass instructions.
