/**
 * Device Registration Module
 * 
 * Manages local device ID persistence and Firestore device document.
 * SpectroCAP™ Phase 1 — Windows Tauri Client
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const DEVICE_ID_KEY = 'spectrocap.deviceId';

/**
 * Get or create a unique device ID for this client
 * Persists to localStorage for reuse across sessions
 */
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Device document structure (matches Lane 3 Firestore schema)
 */
export interface DeviceDoc {
  deviceId: string;
  name: string;
  platform: 'windows' | 'android';
  createdAt: Timestamp;
  lastSeenAt: Timestamp;
  status: 'active' | 'revoked';
}

/**
 * Register or update device in Firestore
 */
export async function registerDevice(
  uid: string,
  deviceName: string = 'Windows Client'
): Promise<DeviceDoc> {
  const deviceId = getOrCreateDeviceId();
  const now = Timestamp.now();

  const deviceDoc: DeviceDoc = {
    deviceId,
    name: deviceName,
    platform: 'windows',
    createdAt: now,
    lastSeenAt: now,
    status: 'active',
  };

  const deviceRef = doc(db, `users/${uid}/devices/${deviceId}`);
  await setDoc(deviceRef, deviceDoc);

  return deviceDoc;
}

/**
 * Update lastSeenAt timestamp
 */
export async function updateDeviceLastSeen(uid: string, deviceId: string): Promise<void> {
  const deviceRef = doc(db, `users/${uid}/devices/${deviceId}`);
  await setDoc(
    deviceRef,
    { lastSeenAt: Timestamp.now() },
    { merge: true }
  );
}
