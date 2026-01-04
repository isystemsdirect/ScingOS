import * as functions from 'firebase-functions';
import { asString, getRecord } from '../shared/types/safe';
import { enforceBaneCallable } from '../bane/enforce';

/**
 * AIP (Augmented Intelligence Portal)
 * Real-time communication protocol handlers
 */

// AIP message handler
export const handleMessage = functions.https.onCall(async (data, context) => {
  const gate = await enforceBaneCallable({ name: 'aip.handleMessage', data, ctx: context });
  const uid = gate.uid;

  const { type, payload } = data;

  switch (type) {
  case 'task.request':
    return await handleTaskRequest(payload, uid);
    
  case 'context.update':
    return await handleContextUpdate(payload, uid);
    
  default:
    throw new functions.https.HttpsError('invalid-argument', `Unknown message type: ${type}`);
  }
});

async function handleTaskRequest(payload: unknown, userId: string) {
  const p = getRecord(payload, 'aip.taskRequest');
  const action = asString(p.action);

  console.log(`Task request from ${userId}: ${action}`);

  // Route to appropriate handler
  // TODO: Implement actual routing logic

  return {
    status: 'success',
    result: {
      message: `Task '${action}' processed`,
    },
  };
}

async function handleContextUpdate(payload: unknown, userId: string) {
  const p = getRecord(payload, 'aip.contextUpdate');
  const updates = p.updates;

  console.log(`Context update from ${userId}:`, updates);

  // Update session context in Firestore
  // TODO: Implement context storage

  return {
    status: 'success',
  };
}

export const aipRouter = {
  handleMessage,
};