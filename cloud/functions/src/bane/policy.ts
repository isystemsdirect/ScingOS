import * as admin from 'firebase-admin';

export async function checkPolicy(
  userId: string,
  action: string,
  _resource?: unknown
): Promise<boolean> {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    return false;
  }

  const user = userDoc.data();
  const role = user?.role || 'viewer';

  // Simple role-based policy check
  const policies: Record<string, string[]> = {
    'admin': ['*'],
    'inspector': [
      'camera.read',
      'camera.write',
      'inspection.create',
      'inspection.update',
      'inspection.finalize',
    ],
    'viewer': [
      'inspection.read',
    ],
  };

  const allowedActions = policies[role] || [];
  return allowedActions.includes('*') || allowedActions.includes(action);
}