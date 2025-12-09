/**
 * ISDCProtocol2025 Type Definitions
 * 
 * ISD-Communications Protocol for standardized inspection workflows
 * and data synchronization across all inspection systems.
 */

/**
 * Protocol version identifier
 */
export const ISDC_PROTOCOL_VERSION = '2025.1.0';

/**
 * Base message structure for ISDCProtocol2025
 */
export interface ISDCMessage {
  protocol: 'isdc';
  version: string;
  type: ISDCMessageType;
  id: string;
  timestamp: string;
  session_id: string;
  sender: 'client' | 'server';
  payload: ISDCPayload;
  signature?: string;
}

/**
 * Message types supported by ISDCProtocol2025
 */
export type ISDCMessageType =
  | 'sync.request'
  | 'sync.response'
  | 'sync.update'
  | 'inspection.create'
  | 'inspection.update'
  | 'inspection.delete'
  | 'inspection.query'
  | 'finding.create'
  | 'finding.update'
  | 'finding.delete'
  | 'details.sync'
  | 'details.update'
  | 'conflict.resolution'
  | 'audit.log';

/**
 * Payload types for different message types
 */
export type ISDCPayload =
  | SyncRequestPayload
  | SyncResponsePayload
  | SyncUpdatePayload
  | InspectionPayload
  | FindingPayload
  | DetailsSyncPayload
  | ConflictResolutionPayload
  | AuditLogPayload;

/**
 * Sync request payload
 */
export interface SyncRequestPayload {
  entity_type: 'inspection' | 'finding' | 'report' | 'all';
  since?: string; // ISO 8601 timestamp
  filters?: Record<string, any>;
  include_deleted?: boolean;
}

/**
 * Sync response payload
 */
export interface SyncResponsePayload {
  status: 'success' | 'partial' | 'failed';
  entities: SyncEntity[];
  conflicts?: ConflictInfo[];
  next_cursor?: string;
  has_more: boolean;
}

/**
 * Sync update payload for real-time updates
 */
export interface SyncUpdatePayload {
  entity_type: 'inspection' | 'finding' | 'report';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  data: InspectionDetails | FindingDetails | ReportDetails;
  version: number;
  updated_by: string;
  updated_at: string;
}

/**
 * Inspection details structure
 */
export interface InspectionDetails {
  id: string;
  property: PropertyInfo;
  type: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  inspector_id: string;
  created_at: string;
  updated_at: string;
  version: number;
  findings: FindingDetails[];
  metadata?: Record<string, any>;
  sync_status?: SyncStatus;
}

/**
 * Property information
 */
export interface PropertyInfo {
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Finding details structure
 */
export interface FindingDetails {
  id: string;
  inspection_id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  code_reference?: string;
  location: string;
  photos?: string[];
  voice_notes?: string[];
  created_at: string;
  updated_at: string;
  version: number;
  status: 'open' | 'resolved' | 'deferred';
  sync_status?: SyncStatus;
}

/**
 * Report details structure
 */
export interface ReportDetails {
  id: string;
  inspection_id: string;
  format: 'pdf' | 'html' | 'json';
  template: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  created_at: string;
  expires_at?: string;
  version: number;
}

/**
 * Sync status tracking
 */
export interface SyncStatus {
  last_synced_at?: string;
  sync_state: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error';
  conflict_id?: string;
  error_message?: string;
}

/**
 * Sync entity wrapper
 */
export interface SyncEntity {
  entity_type: 'inspection' | 'finding' | 'report';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  data: InspectionDetails | FindingDetails | ReportDetails;
  version: number;
  timestamp: string;
}

/**
 * Conflict information
 */
export interface ConflictInfo {
  conflict_id: string;
  entity_type: 'inspection' | 'finding' | 'report';
  entity_id: string;
  local_version: number;
  remote_version: number;
  local_data: any;
  remote_data: any;
  conflict_fields: string[];
}

/**
 * Conflict resolution payload
 */
export interface ConflictResolutionPayload {
  conflict_id: string;
  resolution_strategy: 'local' | 'remote' | 'merge' | 'manual';
  merged_data?: any;
  resolved_by: string;
  resolved_at: string;
}

/**
 * Inspection payload for create/update operations
 */
export interface InspectionPayload {
  inspection: InspectionDetails;
  audit_context?: AuditContext;
}

/**
 * Finding payload for create/update operations
 */
export interface FindingPayload {
  finding: FindingDetails;
  audit_context?: AuditContext;
}

/**
 * Details sync payload - primary sync functionality
 */
export interface DetailsSyncPayload {
  sync_mode: 'full' | 'incremental' | 'selective';
  entities: {
    inspections?: string[]; // IDs to sync
    findings?: string[];
    reports?: string[];
  };
  client_state: {
    last_sync_timestamp?: string;
    local_versions: Record<string, number>;
  };
  options?: {
    include_media?: boolean;
    compress_data?: boolean;
    batch_size?: number;
  };
}

/**
 * Audit context for BANE integration
 */
export interface AuditContext {
  user_id: string;
  org_id?: string;
  device_id: string;
  session_id: string;
  capability_tokens?: string[];
  action: string;
  metadata?: Record<string, any>;
}

/**
 * Audit log payload
 */
export interface AuditLogPayload {
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  timestamp: string;
  changes?: Record<string, any>;
  result: 'success' | 'failed' | 'denied';
  sdr_id?: string; // Security Decision Record ID
}

/**
 * Protocol error codes
 */
export enum ISDCErrorCode {
  SYNC_CONFLICT = 'ISDC_SYNC_CONFLICT',
  VERSION_MISMATCH = 'ISDC_VERSION_MISMATCH',
  INVALID_ENTITY = 'ISDC_INVALID_ENTITY',
  UNAUTHORIZED = 'ISDC_UNAUTHORIZED',
  SYNC_FAILED = 'ISDC_SYNC_FAILED',
  ENTITY_NOT_FOUND = 'ISDC_ENTITY_NOT_FOUND',
  CAPABILITY_DENIED = 'ISDC_CAPABILITY_DENIED',
}

/**
 * Protocol error structure
 */
export interface ISDCError {
  code: ISDCErrorCode;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
}
