import * as functions from 'firebase-functions';
import { signReport } from '../../../../scing/ui/exportSigner';
import { asString, isRecord } from '../shared/types/safe';
import { enforceBaneCallable } from '../bane/enforce';

export const exportInspectionReport = functions.https.onCall(async (data, ctx) => {
  await enforceBaneCallable({ name: 'exportInspectionReport', data, ctx });

  const { report } = data ?? {};
  if (!report) throw new functions.https.HttpsError('invalid-argument', 'Missing fields');

  const envKey = process.env.SCING_REPORT_SIGNING_KEY_PEM;
  const cfg = functions.config?.() as unknown;
  const cfgKey =
    isRecord(cfg) && isRecord(cfg.scing)
      ? asString(cfg.scing.report_signing_key_pem)
      : '';
  const privateKeyPem = envKey || cfgKey;
  if (!privateKeyPem) {
    throw new functions.https.HttpsError('failed-precondition', 'SIGNING_KEY_NOT_CONFIGURED');
  }

  const signature = signReport(report, privateKeyPem);
  return { report, signature, signedAt: new Date().toISOString() };
});
