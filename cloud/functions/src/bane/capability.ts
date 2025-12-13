import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

interface CapabilityToken {
  cap: string;
  userId: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

const SECRET_KEY = process.env.BANE_SECRET_KEY || 'dev-secret-key-change-in-production';

export async function requestCapability(
  userId: string,
  action: string,
  _metadata?: any
): Promise<CapabilityToken> {
  // Check user permissions
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const user = userDoc.data();
  
  // Check role-based permissions
  if (!canPerformAction(user?.role, action)) {
    throw new Error(`User role '${user?.role}' cannot perform action '${action}'`);
  }

  // Generate capability token
  const issuedAt = Date.now();
  const expiresAt = issuedAt + (60 * 60 * 1000); // 1 hour

  const token: CapabilityToken = {
    cap: action,
    userId,
    issuedAt,
    expiresAt,
    signature: '',
  };

  // Sign token
  const payload = `${token.cap}:${token.userId}:${token.issuedAt}:${token.expiresAt}`;
  token.signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');

  return token;
}

export function verifyCapability(token: CapabilityToken): boolean {
  // Check expiration
  if (Date.now() > token.expiresAt) {
    return false;
  }

  // Verify signature
  const payload = `${token.cap}:${token.userId}:${token.issuedAt}:${token.expiresAt}`;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');

  return token.signature === expectedSignature;
}

function canPerformAction(role: string, action: string): boolean {
  const permissions: Record<string, string[]> = {
    'admin': ['*'],
    'inspector': [
      'camera.read',
      'camera.write',
      'inspection.create',
      'inspection.update',
      'inspection.finalize',
      'file.read',
      'file.write',
    ],
    'viewer': [
      'inspection.read',
      'file.read',
    ],
  };

  const userPermissions = permissions[role] || [];
  return userPermissions.includes('*') || userPermissions.includes(action);
}