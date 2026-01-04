import type { BaneStore } from './baneStore';
import type { BaneAuditRecord, BaneEventRecord, BaneIncidentRecord } from './records';
import { BANE_COLLECTIONS } from './collections';

type FirestoreDocRef = {
  id?: string;
  set: (data: unknown, opts?: { merge?: boolean }) => Promise<unknown>;
};

type FirestoreQuerySnap = {
  docs: Array<{ id: string; data: () => any }>;
  forEach?: (cb: (d: { id: string; data: () => any }) => void) => void;
};

type FirestoreQuery = {
  orderBy?: (field: string, dir: 'asc' | 'desc') => FirestoreQuery;
  limit?: (n: number) => FirestoreQuery;
  where?: (field: string, op: any, value: any) => FirestoreQuery;
  get: () => Promise<FirestoreQuerySnap>;
};

type FirestoreCollectionRef = FirestoreQuery & {
  doc: (id?: string) => FirestoreDocRef;
};

type FirestoreLike = {
  collection: (name: string) => FirestoreCollectionRef;
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export class FirestoreBaneStore implements BaneStore {
  private readonly db: FirestoreLike;

  constructor(db: FirestoreLike) {
    this.db = db;
  }

  async appendAudit(record: BaneAuditRecord): Promise<void> {
    const ref = this.db.collection(BANE_COLLECTIONS.audits).doc();
    await ref.set({ ...record, id: ref.id ?? undefined }, { merge: false });
  }

  async appendEvent(event: BaneEventRecord): Promise<void> {
    const ref = this.db.collection(BANE_COLLECTIONS.events).doc();
    await ref.set({ ...event, id: ref.id ?? undefined }, { merge: false });
  }

  async getRecentAudits(limit: number): Promise<BaneAuditRecord[]> {
    const q = this.db
      .collection(BANE_COLLECTIONS.audits)
      .orderBy?.('at', 'desc')
      .limit?.(limit);

    const snap = await (q ?? (this.db.collection(BANE_COLLECTIONS.audits) as any)).get();
    const docs = asArray<{ id: string; data: () => any }>((snap as any)?.docs ?? []);
    return docs.map((d) => d.data() as BaneAuditRecord);
  }

  async appendIncident(incident: BaneIncidentRecord): Promise<void> {
    const ref = this.db.collection(BANE_COLLECTIONS.incidents).doc();
    await ref.set({ ...incident, id: ref.id ?? undefined }, { merge: false });
  }

  async getRecentIncidents(limit: number): Promise<BaneIncidentRecord[]> {
    const q = this.db
      .collection(BANE_COLLECTIONS.incidents)
      .orderBy?.('occurredAt', 'desc')
      .limit?.(limit);

    const snap = await (q ?? (this.db.collection(BANE_COLLECTIONS.incidents) as any)).get();
    const docs = asArray<{ id: string; data: () => any }>((snap as any)?.docs ?? []);
    return docs.map((d) => d.data() as BaneIncidentRecord);
  }

  async getIncidentByTrace(traceId: string): Promise<BaneIncidentRecord | null> {
    const q = this.db
      .collection(BANE_COLLECTIONS.incidents)
      .where?.('traceId', '==', traceId)
      .limit?.(1);

    const snap = await (q ?? (this.db.collection(BANE_COLLECTIONS.incidents) as any)).get();
    const docs = asArray<{ id: string; data: () => any }>((snap as any)?.docs ?? []);
    if (!docs.length) return null;
    return docs[0].data() as BaneIncidentRecord;
  }
}
