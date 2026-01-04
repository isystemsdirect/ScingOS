import React, { createContext, useMemo } from 'react';
import type { ObsEvent } from '@scing/obs/obsTypes';
import { makeObsEvent } from '@scing/obs/obsLogger';
import { enqueueObs } from '@scing/obs/obsClientQueue';
import { flushObs } from '@scing/obs/obsClientFlush';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../../lib/firebase';

export const ObsContext = createContext<{
  emit: (
    evt: Omit<ObsEvent, 'eventId' | 'createdAt' | 'correlationId'> & { correlationId?: string; error?: any }
  ) => void;
  flush: () => Promise<{ ok: boolean; flushed: number }>;
}>({ emit: () => {}, flush: async () => ({ ok: true, flushed: 0 }) });

export const ObsProvider: React.FC<{
  children: React.ReactNode;
  identity?: { orgId?: string; uid?: string; deviceId?: string };
}> = ({ children, identity }) => {
  const writeFn = async (evt: ObsEvent) => {
    if (!app) throw new Error('FIREBASE_NOT_CONFIGURED');
    const functions = getFunctions(app);
    const fn = httpsCallable(functions, 'writeObsEvent');
    await fn({ event: evt });
  };

  const api = useMemo(
    () => ({
      emit: (partial: any) => {
        const evt = makeObsEvent({
          severity: partial.severity,
          scope: partial.scope,
          message: partial.message,
          orgId: identity?.orgId,
          uid: identity?.uid,
          deviceId: identity?.deviceId,
          inspectionId: partial.inspectionId,
          engineId: partial.engineId,
          phase: partial.phase,
          correlationId: partial.correlationId,
          error: partial.error,
          meta: partial.meta,
          tags: partial.tags,
          offlineCaptured: typeof navigator !== 'undefined' ? !navigator.onLine : false,
        });
        enqueueObs(evt);
      },
      flush: async () => {
        try {
          return await flushObs(writeFn, 50);
        } catch {
          return { ok: false, flushed: 0 };
        }
      },
    }),
    [identity?.orgId, identity?.uid, identity?.deviceId]
  );

  return <ObsContext.Provider value={api}>{children}</ObsContext.Provider>;
};
