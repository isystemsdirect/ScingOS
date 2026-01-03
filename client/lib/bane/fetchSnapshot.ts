import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import app from '../firebase';
import type { PolicySnapshot } from '../../../scing/bane';
import { saveSnapshot } from './cache';

export async function fetchAndCachePolicySnapshot(orgId: string): Promise<PolicySnapshot> {
  if (!app) throw new Error('FIREBASE_NOT_CONFIGURED');
  const functions = getFunctions(app);

  // Stable callable name exported from Cloud Functions entrypoint.
  const fn = httpsCallable(functions, 'baneIssuePolicySnapshot');
  const res = await fn({ orgId });
  const snap = res.data as PolicySnapshot;
  saveSnapshot(snap);
  return snap;
}
