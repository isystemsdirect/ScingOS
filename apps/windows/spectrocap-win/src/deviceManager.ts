/**
 * Phase 2A Device Manager for SpectroCAP™
 * 
 * Minimal UI for listing devices and revoking them (BANE-ready).
 * 
 * Features:
 * - List all devices for current user (name, platform, status, lastSeenAt)
 * - Display public key fingerprint (SHA256 first 16 chars)
 * - Revoke device (set status to "revoked")
 * - Refresh device list
 */

import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Device {
  deviceId: string;
  name: string;
  platform: "android" | "windows";
  status: "active" | "revoked";
  lastSeenAt: Date;
  pubSignKeyFingerprint: string;
  pubBoxKeyFingerprint: string;
}

/**
 * Computes SHA256 fingerprint of public key
 * Returns first 16 characters of base64-encoded hash
 */
export async function computeKeyFingerprint(pubKeyBase64: string): Promise<string> {
  // Decode base64 to bytes
  const keyBytes = new Uint8Array(
    atob(pubKeyBase64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  // Compute SHA256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Return first 16 characters
  return hashHex.substring(0, 16);
}

/**
 * Retrieves list of devices for current user (Phase 2A)
 *
 * @param uid Firebase user ID
 * @returns Array of Device objects (all platforms)
 */
export async function listDevices(uid: string): Promise<Device[]> {
  const devicesRef = collection(db, `users/${uid}/devices`);
  const q = query(devicesRef);
  const snapshot = await getDocs(q);

  const devices: Device[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const pubSignKeyFingerprint = await computeKeyFingerprint(
      data.pubSignKey || ""
    );
    const pubBoxKeyFingerprint = await computeKeyFingerprint(
      data.pubBoxKey || ""
    );

    const lastSeenAt =
      data.lastSeenAt instanceof Timestamp
        ? data.lastSeenAt.toDate()
        : new Date(data.lastSeenAt);

    devices.push({
      deviceId: docSnap.id,
      name: data.name || "Unknown Device",
      platform: data.platform || "unknown",
      status: data.status || "active",
      lastSeenAt,
      pubSignKeyFingerprint,
      pubBoxKeyFingerprint,
    });
  }

  return devices.sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
}

/**
 * Revokes a device (sets status to "revoked")
 *
 * After revocation:
 * - Device is excluded from future recipient lists
 * - Device cannot decrypt messages (no envelope for it)
 *
 * @param uid Firebase user ID
 * @param deviceId Device UUID to revoke
 */
export async function revokeDevice(uid: string, deviceId: string): Promise<void> {
  const deviceRef = doc(db, `users/${uid}/devices/${deviceId}`);
  await updateDoc(deviceRef, { status: "revoked" });
}

/**
 * Re-activates a device (sets status to "active")
 *
 * @param uid Firebase user ID
 * @param deviceId Device UUID to activate
 */
export async function activateDevice(uid: string, deviceId: string): Promise<void> {
  const deviceRef = doc(db, `users/${uid}/devices/${deviceId}`);
  await updateDoc(deviceRef, { status: "active" });
}

/**
 * Gets detailed info for a specific device
 *
 * @param uid Firebase user ID
 * @param deviceId Device UUID
 * @returns Device object or null if not found
 */
export async function getDevice(uid: string, deviceId: string): Promise<Device | null> {
  const deviceRef = doc(db, `users/${uid}/devices/${deviceId}`);
  const docSnap = await getDoc(deviceRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  const pubSignKeyFingerprint = await computeKeyFingerprint(data.pubSignKey || "");
  const pubBoxKeyFingerprint = await computeKeyFingerprint(data.pubBoxKey || "");

  const lastSeenAt =
    data.lastSeenAt instanceof Timestamp
      ? data.lastSeenAt.toDate()
      : new Date(data.lastSeenAt);

  return {
    deviceId: docSnap.id,
    name: data.name || "Unknown Device",
    platform: data.platform || "unknown",
    status: data.status || "active",
    lastSeenAt,
    pubSignKeyFingerprint,
    pubBoxKeyFingerprint,
  };
}

/**
 * Returns emoji icon for platform
 */
export function getPlatformIcon(platform: string): string {
  switch (platform) {
    case "android":
      return "📱";
    case "windows":
      return "🪟";
    default:
      return "💻";
  }
}

/**
 * Returns friendly status label
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "🟢 Active";
    case "revoked":
      return "🔴 Revoked";
    default:
      return "❓ Unknown";
  }
}

/**
 * Formats last seen timestamp for display
 */
export function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}
