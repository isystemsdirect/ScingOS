/**
 * ISDCProtocol2025 Module
 * ISD-Communications Protocol for inspection data synchronization
 */

export { handleISDCMessage } from './protocol';
export * from './types';

import { handleISDCMessage } from './protocol';

/**
 * ISDC router for Firebase Cloud Functions
 */
export const isdcRouter = {
  handleMessage: handleISDCMessage,
};
