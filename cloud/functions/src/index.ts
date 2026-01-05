import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { baneRouter } from './bane';
import { baneIssueEntitlement, baneIssuePolicySnapshot, baneRevokeEntitlement } from './bane';
import { evidenceAppendEvent, evidenceFinalizeArtifact } from './evidence';
import { exportInspectionReport, buildInspectionReport, exportInspectionBundle } from './report';
import { writeObsEvent } from './obs';
import { createInspection } from './inspection/create';
import { finalizeInspection } from './inspection/finalize';
import { lariRouter } from './lari';
import { aipRouter } from './aip';
import { isdcRouter } from './isdc';
import { enforceBaneHttp } from './bane/enforce';

// Initialize Firebase Admin
admin.initializeApp();

// Export BANE functions (security)
export const bane = baneRouter;

// Export entitlement endpoints as first-class callables (stable names)
export { baneIssueEntitlement, baneRevokeEntitlement, baneIssuePolicySnapshot };

// Export Evidence functions (chain-of-custody)
export { evidenceFinalizeArtifact, evidenceAppendEvent };

// Export SCING report export
export { exportInspectionReport };

// Export Inspection workflow endpoints
export { createInspection, finalizeInspection, buildInspectionReport, exportInspectionBundle };

// Export Observability callable
export { writeObsEvent };

// Export LARI functions (AI engines)
export const lari = lariRouter;

// Export AIP functions (protocol)
export const aip = aipRouter;

// Export ISDC functions (ISDCProtocol2025)
export const isdc = isdcRouter;

// Health check endpoint
export const healthCheck = functions.https.onRequest((req, res) => {
  const gate = enforceBaneHttp({ req, res, name: 'healthCheck' });
  if (!gate.ok) return;

  res.status(200).json({
    status: 'healthy',
    service: 'ScingOS Cloud Functions',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});


// Example: User creation trigger
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  // Create user document in Firestore
  await admin.firestore().collection('users').doc(uid).set({
    email,
    displayName: displayName || null,
    role: 'inspector',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`User created: ${uid}`);
});

// Example: Inspection completion trigger
export const onInspectionComplete = functions.firestore
  .document('inspections/{inspectionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'completed' && after.status === 'completed') {
      const inspectionId = context.params.inspectionId;
      console.log(`Inspection completed: ${inspectionId}`);

      // TODO: Generate report
      // TODO: Send notification
    }
  });