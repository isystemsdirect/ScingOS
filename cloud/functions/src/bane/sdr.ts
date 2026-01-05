import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { isRecord } from '../shared/types/safe';

interface SDRData {
  userId: string;
  action: string;
  result: 'success' | 'failed' | 'denied';
  metadata?: unknown;
}

export async function createSDR(data: SDRData): Promise<string> {
  const sdrId = crypto.randomUUID();
  const timestamp = new Date();

  const metadata = isRecord(data.metadata) ? data.metadata : {};

  const sdr = {
    sdrId,
    timestamp,
    userId: data.userId,
    action: data.action,
    result: data.result,
    metadata,
    signature: '', // Will be set below
  };

  // Create signature
  const payload = JSON.stringify({
    sdrId: sdr.sdrId,
    timestamp: sdr.timestamp.toISOString(),
    userId: sdr.userId,
    action: sdr.action,
    result: sdr.result,
  });

  sdr.signature = crypto
    .createHash('sha256')
    .update(payload)
    .digest('hex');

  // Store in Firestore
  await admin.firestore().collection('sdrs').doc(sdrId).set(sdr);

  console.log(`SDR created: ${sdrId}`);
  return sdrId;
}