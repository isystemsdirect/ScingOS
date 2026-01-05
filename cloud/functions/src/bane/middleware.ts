import * as admin from 'firebase-admin';

export async function assertOrgAdmin(orgId: string, uid: string): Promise<{ role: string }> {
  const db = admin.firestore();
  const snap = await db.doc(`orgs/${orgId}/members/${uid}`).get();
  if (!snap.exists) throw new Error('NO_ROLE');
  const role = String(snap.data()?.role ?? '');
  if (!['owner', 'admin'].includes(role)) throw new Error('FORBIDDEN');
  return { role };
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}
