import { makeBaneHttpGuard } from '../integrations/httpMiddleware';
import { makeBaneToolGuard } from '../integrations/toolGuard';
import type { BaneRuntimeConfig } from '../runtime/config';
import { InMemoryBaneStore } from '../storage/inMemoryBaneStore';

// Server-only singleton guard construction.
// If/when Admin Firestore is available server-side, swap store in Step 5.
const config: BaneRuntimeConfig = {
  profileId: 'bane_fog_v1',
  store: new InMemoryBaneStore(),
};

export const baneHttpGuard = makeBaneHttpGuard(config);
export const baneToolGuard = makeBaneToolGuard(config);
