import * as functions from 'firebase-functions';
import { understandIntent } from './language';
import { detectDefects } from './vision';
import { generateReport } from './reasoning';

/**
 * LARI (Language and Reasoning Intelligence)
 * AI engines for perception, analysis, and decision support
 */

// Language understanding
export const understandIntentFunc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { text } = data;
  const intent = await understandIntent(text);
  return { intent };
});

// Vision: Detect defects
export const detectDefectsFunc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { imageUrl } = data;
  const defects = await detectDefects(imageUrl);
  return { defects };
});

// Reasoning: Generate report
export const generateReportFunc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { inspectionId } = data;
  const report = await generateReport(inspectionId);
  return { report };
});

export const lariRouter = {
  understandIntent: understandIntentFunc,
  detectDefects: detectDefectsFunc,
  generateReport: generateReportFunc,
};