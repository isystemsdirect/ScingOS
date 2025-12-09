/**
 * ISDCProtocol2025 Client Library
 * Client-side implementation for inspection data synchronization
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import type {
  ISDCMessage,
  ISDCMessageType,
  DetailsSyncPayload,
  SyncRequestPayload,
  SyncResponsePayload,
  InspectionDetails,
  FindingDetails,
  InspectionPayload,
  FindingPayload,
  ConflictResolutionPayload,
  ISDC_PROTOCOL_VERSION,
} from './types';

/**
 * ISDCProtocol2025 Client
 */
export class ISDCClient {
  private sessionId: string;
  private functions: ReturnType<typeof getFunctions>;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
    this.functions = getFunctions();
  }

  /**
   * Send ISDC protocol message
   */
  private async sendMessage(
    type: ISDCMessageType,
    payload: any
  ): Promise<any> {
    const message: ISDCMessage = {
      protocol: 'isdc',
      version: '2025.1.0',
      type,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      sender: 'client',
      payload,
    };

    const handleMessage = httpsCallable(this.functions, 'isdc-handleMessage');
    const response = await handleMessage(message);

    return response.data;
  }

  /**
   * Sync inspection details
   * Primary method for syncing inspection data with the server
   */
  async syncDetails(
    entities: {
      inspections?: string[];
      findings?: string[];
      reports?: string[];
    },
    localVersions: Record<string, number>,
    options?: {
      sync_mode?: 'full' | 'incremental' | 'selective';
      include_media?: boolean;
      compress_data?: boolean;
      batch_size?: number;
    }
  ): Promise<SyncResponsePayload> {
    const payload: DetailsSyncPayload = {
      sync_mode: options?.sync_mode || 'incremental',
      entities,
      client_state: {
        last_sync_timestamp: new Date().toISOString(),
        local_versions: localVersions,
      },
      options,
    };

    return await this.sendMessage('details.sync', payload);
  }

  /**
   * Request sync for entities modified since a specific timestamp
   */
  async requestSync(
    entityType: 'inspection' | 'finding' | 'report' | 'all',
    since?: string,
    filters?: Record<string, any>
  ): Promise<SyncResponsePayload> {
    const payload: SyncRequestPayload = {
      entity_type: entityType,
      since,
      filters,
    };

    return await this.sendMessage('sync.request', payload);
  }

  /**
   * Create a new inspection
   */
  async createInspection(
    inspection: Omit<InspectionDetails, 'id' | 'version' | 'created_at' | 'updated_at'>
  ): Promise<{ status: string; inspection_id: string; version: number }> {
    const payload: InspectionPayload = {
      inspection: inspection as InspectionDetails,
    };

    return await this.sendMessage('inspection.create', payload);
  }

  /**
   * Update an existing inspection
   */
  async updateInspection(
    inspection: InspectionDetails
  ): Promise<{ status: string; inspection_id: string; version: number }> {
    const payload: InspectionPayload = {
      inspection,
    };

    return await this.sendMessage('inspection.update', payload);
  }

  /**
   * Create a new finding
   */
  async createFinding(
    finding: Omit<FindingDetails, 'id' | 'version' | 'created_at' | 'updated_at'>
  ): Promise<{ status: string; finding_id: string; version: number }> {
    const payload: FindingPayload = {
      finding: finding as FindingDetails,
    };

    return await this.sendMessage('finding.create', payload);
  }

  /**
   * Update an existing finding
   */
  async updateFinding(
    finding: FindingDetails
  ): Promise<{ status: string; finding_id: string; version: number }> {
    const payload: FindingPayload = {
      finding,
    };

    return await this.sendMessage('finding.update', payload);
  }

  /**
   * Resolve a sync conflict
   */
  async resolveConflict(
    conflictId: string,
    strategy: 'local' | 'remote' | 'merge' | 'manual',
    mergedData?: any,
    userId?: string
  ): Promise<{ status: string; conflict_id: string; resolution: string }> {
    const payload: ConflictResolutionPayload = {
      conflict_id: conflictId,
      resolution_strategy: strategy,
      merged_data: mergedData,
      resolved_by: userId || 'unknown',
      resolved_at: new Date().toISOString(),
    };

    return await this.sendMessage('conflict.resolution', payload);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `isdc_session_${crypto.randomUUID()}`;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

/**
 * Create a new ISDC client instance
 */
export function createISDCClient(sessionId?: string): ISDCClient {
  return new ISDCClient(sessionId);
}
