import { makeBaneHttpGuard } from '../integrations/httpMiddleware';
import { makeBaneToolGuard } from '../integrations/toolGuard';
import type { BaneRuntimeConfig } from '../runtime/config';
import { InMemoryBaneStore } from '../storage/inMemoryBaneStore';
import { FirestoreBaneStore } from '../storage/firestoreBaneStore';

import { getAdminFirestore } from '../../firebase/admin';

function buildStore() {
  try {
    const db = getAdminFirestore();
    return new FirestoreBaneStore(db as any);
  } catch {
    return new InMemoryBaneStore();
  }
}

// Server-only singleton guard construction.
const config: BaneRuntimeConfig = {
  profileId: 'bane_fog_v1',
  store: buildStore(),
};

export const baneHttpGuard = makeBaneHttpGuard(config);
export const baneToolGuard = makeBaneToolGuard(config);
