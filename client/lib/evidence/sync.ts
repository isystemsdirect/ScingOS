import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { doc, setDoc } from 'firebase/firestore';
import app, { firestore } from '../firebase';
import { dequeue, loadQueue, saveQueue } from './localQueue';

export async function syncOnce(): Promise<{ ok: boolean; processed: number; remaining: number }> {
  const q = loadQueue();
  if (q.length === 0) return { ok: true, processed: 0, remaining: 0 };

  const item = dequeue();
  if (!item) return { ok: true, processed: 0, remaining: 0 };

  try {
    if (!app) throw new Error('FIREBASE_NOT_CONFIGURED');
    if (!firestore) throw new Error('FIRESTORE_NOT_CONFIGURED');

    if (item.kind === 'artifactRecord') {
      const ref = doc(firestore, `inspections/${item.inspectionId}/artifacts/${item.artifactId}`);
      await setDoc(ref, item.record, { merge: true });
    }

    if (item.kind === 'finalize') {
      const functions = getFunctions(app);
      const fn = httpsCallable(functions, 'evidenceFinalizeArtifact');
      await fn({
        orgId: item.orgId,
        inspectionId: item.inspectionId,
        artifactId: item.artifactId,
        contentHash: item.contentHash,
        signature: item.signature ?? null,
        signer: item.signer,
      });
    }

    return { ok: true, processed: 1, remaining: loadQueue().length };
  } catch {
    const remaining = loadQueue();
    saveQueue([item, ...remaining]);
    return { ok: false, processed: 0, remaining: loadQueue().length };
  }
}
