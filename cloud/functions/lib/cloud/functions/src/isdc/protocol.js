"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleISDCMessage = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const capability_1 = require("../bane/capability");
const sdr_1 = require("../bane/sdr");
const enforce_1 = require("../bane/enforce");
const toolBoundary_1 = require("../../../../scing/bane/server/toolBoundary");
const types_1 = require("./types");
/**
 * Check if user has required capability
 * @param {string} userId User ID
 * @param {string} action Action to check
 * @return {Promise<boolean>} True if user has capability
 */
async function checkCapability(userId, action) {
    try {
        await (0, capability_1.requestCapability)(userId, action);
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Create security decision record
 * @param {object} data SDR data
 * @return {Promise<string>} SDR ID
 */
async function createSecurityDecisionRecord(data) {
    return await (0, sdr_1.createSDR)({
        userId: data.userId,
        action: data.action,
        result: data.result === 'allowed' ? 'success' : 'denied',
        metadata: data.metadata,
    });
}
/**
 * ISDCProtocol2025 Handler
 * Handles inspection data synchronization and details sync operations
 */
exports.handleISDCMessage = functions.https.onCall(async (data, context) => {
    const gate = await (0, enforce_1.enforceBaneCallable)({ name: 'handleISDCMessage', data, ctx: context });
    const userId = gate.uid;
    const { type, payload } = data;
    console.log(`ISDCProtocol2025 message received: ${type} from user ${userId}`);
    try {
        return await (0, toolBoundary_1.runGuardedTool)({
            toolName: 'isdc_protocol_router',
            requiredCapability: 'tool:db_write',
            payloadText: JSON.stringify({ type, protocol: types_1.ISDC_PROTOCOL_VERSION }),
            identityId: userId,
            capabilities: gate.capabilities,
            exec: async () => {
                // Route message to appropriate handler
                switch (type) {
                    case 'details.sync':
                        return await handleDetailsSync(payload, userId);
                    case 'sync.request':
                        return await handleSyncRequest(payload, userId);
                    case 'inspection.create':
                    case 'inspection.update':
                        return await handleInspectionOperation(type, payload, userId);
                    case 'finding.create':
                    case 'finding.update':
                        return await handleFindingOperation(type, payload, userId);
                    case 'conflict.resolution':
                        return await handleConflictResolution(payload, userId);
                    default:
                        throw new functions.https.HttpsError('invalid-argument', `Unknown ISDCProtocol2025 message type: ${type}`);
                }
            },
        });
    }
    catch (error) {
        if (error?.baneTraceId) {
            throw new functions.https.HttpsError('permission-denied', error.message, { traceId: error.baneTraceId });
        }
        console.error('ISDCProtocol2025 error:', error);
        const message = error instanceof Error ? error.message : 'ISDCProtocol2025 operation failed';
        // Log audit record for failed operations
        await logAuditRecord(userId, type, 'failed', message);
        throw new functions.https.HttpsError('internal', message);
    }
});
/**
 * Handle details sync - primary sync functionality for inspection data
 * @param {DetailsSyncPayload} payload Sync payload
 * @param {string} userId User ID
 * @return {Promise<SyncResponsePayload>} Sync response
 */
async function handleDetailsSync(payload, userId) {
    const { sync_mode, entities, client_state } = payload;
    console.log(`Details sync: mode=${sync_mode}, user=${userId}`);
    // Check sync capability
    const hasCapability = await checkCapability(userId, 'cap:sync.execute');
    if (!hasCapability) {
        await logAuditRecord(userId, 'details.sync', 'denied', 'Missing sync capability');
        throw new functions.https.HttpsError('permission-denied', 'User does not have sync capability');
    }
    const db = admin.firestore();
    const syncEntities = [];
    const conflicts = [];
    try {
        // Sync inspections
        if (entities.inspections && entities.inspections.length > 0) {
            const inspectionResults = await syncInspections(entities.inspections, client_state.local_versions, userId, db);
            syncEntities.push(...inspectionResults.entities);
            conflicts.push(...inspectionResults.conflicts);
        }
        // Sync findings
        if (entities.findings && entities.findings.length > 0) {
            const findingResults = await syncFindings(entities.findings, client_state.local_versions, userId, db);
            syncEntities.push(...findingResults.entities);
            conflicts.push(...findingResults.conflicts);
        }
        // Log successful sync operation
        await logAuditRecord(userId, 'details.sync', 'success', `Synced ${syncEntities.length} entities`);
        // Create SDR for sync operation
        await createSecurityDecisionRecord({
            action: 'sync.execute',
            userId,
            result: 'allowed',
            metadata: {
                sync_mode,
                entities_synced: syncEntities.length,
                conflicts_detected: conflicts.length,
            },
        });
        return {
            status: conflicts.length > 0 ? 'partial' : 'success',
            entities: syncEntities,
            conflicts: conflicts.length > 0 ? conflicts : undefined,
            has_more: false,
        };
    }
    catch (error) {
        console.error('Details sync error:', error);
        throw error;
    }
}
/**
 * Sync inspections and detect conflicts
 */
async function syncInspections(inspectionIds, localVersions, userId, db) {
    const entities = [];
    const conflicts = [];
    for (const inspectionId of inspectionIds) {
        try {
            const inspectionDoc = await db
                .collection('inspections')
                .doc(inspectionId)
                .get();
            if (!inspectionDoc.exists) {
                continue;
            }
            const inspectionData = inspectionDoc.data();
            const localVersion = localVersions[inspectionId] || 0;
            // Check for version conflict
            if (localVersion > 0 && localVersion !== inspectionData.version) {
                conflicts.push({
                    conflict_id: `conflict_${inspectionId}_${Date.now()}`,
                    entity_type: 'inspection',
                    entity_id: inspectionId,
                    local_version: localVersion,
                    remote_version: inspectionData.version,
                    local_data: null, // Client should provide this
                    remote_data: inspectionData,
                    conflict_fields: ['version'],
                });
            }
            entities.push({
                entity_type: 'inspection',
                entity_id: inspectionId,
                operation: 'update',
                data: inspectionData,
                version: inspectionData.version,
                timestamp: inspectionData.updated_at,
            });
        }
        catch (error) {
            console.error(`Error syncing inspection ${inspectionId}:`, error);
        }
    }
    return { entities, conflicts };
}
/**
 * Sync findings and detect conflicts
 */
async function syncFindings(findingIds, localVersions, userId, db) {
    const entities = [];
    const conflicts = [];
    for (const findingId of findingIds) {
        try {
            const findingDoc = await db
                .collection('findings')
                .doc(findingId)
                .get();
            if (!findingDoc.exists) {
                continue;
            }
            const findingData = findingDoc.data();
            const localVersion = localVersions[findingId] || 0;
            // Check for version conflict
            if (localVersion > 0 && localVersion !== findingData.version) {
                conflicts.push({
                    conflict_id: `conflict_${findingId}_${Date.now()}`,
                    entity_type: 'finding',
                    entity_id: findingId,
                    local_version: localVersion,
                    remote_version: findingData.version,
                    local_data: null,
                    remote_data: findingData,
                    conflict_fields: ['version'],
                });
            }
            entities.push({
                entity_type: 'finding',
                entity_id: findingId,
                operation: 'update',
                data: findingData,
                version: findingData.version,
                timestamp: findingData.updated_at,
            });
        }
        catch (error) {
            console.error(`Error syncing finding ${findingId}:`, error);
        }
    }
    return { entities, conflicts };
}
/**
 * Handle general sync requests
 */
async function handleSyncRequest(payload, userId) {
    const { entity_type, since } = payload;
    const db = admin.firestore();
    const entities = [];
    console.log(`Sync request: entity_type=${entity_type}, since=${since}`);
    // Build query based on entity type
    let query;
    switch (entity_type) {
        case 'inspection':
            query = db.collection('inspections').where('inspector_id', '==', userId);
            break;
        case 'finding':
            query = db.collection('findings');
            break;
        case 'all':
            // Handle all entity types
            const inspectionsSnapshot = await db
                .collection('inspections')
                .where('inspector_id', '==', userId)
                .get();
            inspectionsSnapshot.forEach((doc) => {
                const data = doc.data();
                entities.push({
                    entity_type: 'inspection',
                    entity_id: doc.id,
                    operation: 'update',
                    data,
                    version: data.version,
                    timestamp: data.updated_at,
                });
            });
            return {
                status: 'success',
                entities,
                has_more: false,
            };
        default:
            throw new Error(`Unsupported entity type: ${entity_type}`);
    }
    // Apply timestamp filter if provided
    if (since) {
        query = query.where('updated_at', '>', since);
    }
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
        if (entity_type === 'inspection') {
            const inspection = doc.data();
            entities.push({
                entity_type: 'inspection',
                entity_id: doc.id,
                operation: 'update',
                data: inspection,
                version: inspection.version || 1,
                timestamp: inspection.updated_at,
            });
            return;
        }
        if (entity_type === 'finding') {
            const finding = doc.data();
            entities.push({
                entity_type: 'finding',
                entity_id: doc.id,
                operation: 'update',
                data: finding,
                version: finding.version || 1,
                timestamp: finding.updated_at,
            });
        }
    });
    await logAuditRecord(userId, 'sync.request', 'success', `Retrieved ${entities.length} entities`);
    return {
        status: 'success',
        entities,
        has_more: false,
    };
}
/**
 * Handle inspection create/update operations
 */
async function handleInspectionOperation(type, payload, userId) {
    const db = admin.firestore();
    const { inspection } = payload;
    const isCreate = type === 'inspection.create';
    const capability = isCreate ? 'cap:inspection.create' : 'cap:inspection.update';
    const hasCapability = await checkCapability(userId, capability);
    if (!hasCapability) {
        await logAuditRecord(userId, type, 'denied', `Missing capability: ${capability}`);
        throw new functions.https.HttpsError('permission-denied', `Missing capability: ${capability}`);
    }
    const inspectionData = {
        ...inspection,
        inspector_id: userId,
        updated_at: new Date().toISOString(),
        version: (inspection.version || 0) + 1,
    };
    if (isCreate) {
        inspectionData.created_at = new Date().toISOString();
        inspectionData.status = 'draft';
    }
    const docRef = isCreate ?
        db.collection('inspections').doc() :
        db.collection('inspections').doc(inspection.id);
    await docRef.set(inspectionData, { merge: !isCreate });
    await logAuditRecord(userId, type, 'success', `Inspection ${isCreate ? 'created' : 'updated'}`);
    return {
        status: 'success',
        inspection_id: docRef.id,
        version: inspectionData.version,
    };
}
/**
 * Handle finding create/update operations
 */
async function handleFindingOperation(type, payload, userId) {
    const db = admin.firestore();
    const { finding } = payload;
    const isCreate = type === 'finding.create';
    const capability = isCreate ? 'cap:finding.create' : 'cap:finding.update';
    const hasCapability = await checkCapability(userId, capability);
    if (!hasCapability) {
        await logAuditRecord(userId, type, 'denied', `Missing capability: ${capability}`);
        throw new functions.https.HttpsError('permission-denied', `Missing capability: ${capability}`);
    }
    const findingData = {
        ...finding,
        updated_at: new Date().toISOString(),
        version: (finding.version || 0) + 1,
    };
    if (isCreate) {
        findingData.created_at = new Date().toISOString();
        findingData.status = 'open';
    }
    const docRef = isCreate ?
        db.collection('findings').doc() :
        db.collection('findings').doc(finding.id);
    await docRef.set(findingData, { merge: !isCreate });
    await logAuditRecord(userId, type, 'success', `Finding ${isCreate ? 'created' : 'updated'}`);
    return {
        status: 'success',
        finding_id: docRef.id,
        version: findingData.version,
    };
}
/**
 * Handle conflict resolution
 */
async function handleConflictResolution(payload, userId) {
    const { conflict_id, resolution_strategy } = payload;
    console.log(`Resolving conflict ${conflict_id} with strategy: ${resolution_strategy}`);
    await logAuditRecord(userId, 'conflict.resolution', 'success', `Resolved conflict ${conflict_id}`);
    return {
        status: 'success',
        conflict_id,
        resolution: resolution_strategy,
    };
}
/**
 * Log audit record for ISDCProtocol2025 operations
 */
async function logAuditRecord(userId, action, result, message) {
    const db = admin.firestore();
    await db.collection('audit_logs').add({
        protocol: 'isdc',
        version: types_1.ISDC_PROTOCOL_VERSION,
        user_id: userId,
        action,
        result,
        message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
}
//# sourceMappingURL=protocol.js.map