import * as functions from 'firebase-functions';
import { understandIntent } from './language';
import { detectDefects } from './vision';
import { generateReport } from './reasoning';
import { enforceBaneCallable } from '../bane/enforce';
import { runGuardedTool } from '../../../../scing/bane/server/toolBoundary';

/**
 * LARI (Language and Reasoning Intelligence)
 * AI engines for perception, analysis, and decision support
 */

// Language understanding
export const understandIntentFunc = functions.https.onCall(async (data, context) => {
  const gate = await enforceBaneCallable({ name: 'lari.understandIntent', data, ctx: context });

  const { text } = data;
  try {
    const intent = await runGuardedTool({
      toolName: 'lari_understandIntent',
      requiredCapability: 'tool:external_call',
      payloadText: JSON.stringify({ text: typeof text === 'string' ? text.slice(0, 200) : null }),
      identityId: gate.uid,
      capabilities: gate.capabilities,
      exec: async () => understandIntent(text),
    });
    return { intent };
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});

// Vision: Detect defects
export const detectDefectsFunc = functions.https.onCall(async (data, context) => {
  const gate = await enforceBaneCallable({ name: 'lari.detectDefects', data, ctx: context });

  const { imageUrl } = data;
  try {
    const defects = await runGuardedTool({
      toolName: 'lari_detectDefects',
      requiredCapability: 'tool:external_call',
      payloadText: JSON.stringify({ imageUrl: typeof imageUrl === 'string' ? imageUrl.slice(0, 500) : null }),
      identityId: gate.uid,
      capabilities: gate.capabilities,
      exec: async () => detectDefects(imageUrl),
    });
    return { defects };
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});

// Reasoning: Generate report
export const generateReportFunc = functions.https.onCall(async (data, context) => {
  const gate = await enforceBaneCallable({ name: 'lari.generateReport', data, ctx: context });

  const { inspectionId } = data;
  try {
    const report = await runGuardedTool({
      toolName: 'lari_generateReport',
      requiredCapability: 'tool:db_read',
      payloadText: JSON.stringify({ inspectionId: inspectionId ? String(inspectionId) : null }),
      identityId: gate.uid,
      capabilities: gate.capabilities,
      exec: async () => generateReport(inspectionId),
    });
    return { report };
  } catch (e: any) {
    if (e?.baneTraceId) throw new functions.https.HttpsError('permission-denied', e.message, { traceId: e.baneTraceId });
    throw e;
  }
});

export const lariRouter = {
  understandIntent: understandIntentFunc,
  detectDefects: detectDefectsFunc,
  generateReport: generateReportFunc,
};