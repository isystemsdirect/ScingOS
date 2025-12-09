/**
 * ISDCProtocol2025 Type Definitions (Client)
 * Shared types for client-side implementation
 */

export const ISDC_PROTOCOL_VERSION = '2025.1.0';

export interface ISDCMessage {
  protocol: 'isdc';
  version: string;
  type: ISDCMessageType;
  id: string;
  timestamp: string;
  session_id: string;
  sender: 'client' | 'server';
  payload: any;
  signature?: string;
}

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

export interface SyncRequestPayload {
  entity_type: 'inspection' | 'finding' | 'report' | 'all';
  since?: string;
  filters?: Record<string, any>;
  include_deleted?: boolean;
}

export interface SyncResponsePayload {
  status: 'success' | 'partial' | 'failed';
  entities: SyncEntity[];
  conflicts?: ConflictInfo[];
  next_cursor?: string;
  has_more: boolean;
}

export interface DetailsSyncPayload {
  sync_mode: 'full' | 'incremental' | 'selective';
  entities: {
    inspections?: string[];
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

export interface SyncStatus {
  last_synced_at?: string;
  sync_state: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error';
  conflict_id?: string;
  error_message?: string;
}

export interface SyncEntity {
  entity_type: 'inspection' | 'finding' | 'report';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  data: InspectionDetails | FindingDetails | ReportDetails;
  version: number;
  timestamp: string;
}

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

export interface ConflictResolutionPayload {
  conflict_id: string;
  resolution_strategy: 'local' | 'remote' | 'merge' | 'manual';
  merged_data?: any;
  resolved_by: string;
  resolved_at: string;
}

export interface InspectionPayload {
  inspection: InspectionDetails;
  audit_context?: AuditContext;
}

export interface FindingPayload {
  finding: FindingDetails;
  audit_context?: AuditContext;
}

export interface AuditContext {
  user_id: string;
  org_id?: string;
  device_id: string;
  session_id: string;
  capability_tokens?: string[];
  action: string;
  metadata?: Record<string, any>;
}

export enum ISDCErrorCode {
  SYNC_CONFLICT = 'ISDC_SYNC_CONFLICT',
  VERSION_MISMATCH = 'ISDC_VERSION_MISMATCH',
  INVALID_ENTITY = 'ISDC_INVALID_ENTITY',
  UNAUTHORIZED = 'ISDC_UNAUTHORIZED',
  SYNC_FAILED = 'ISDC_SYNC_FAILED',
  ENTITY_NOT_FOUND = 'ISDC_ENTITY_NOT_FOUND',
  CAPABILITY_DENIED = 'ISDC_CAPABILITY_DENIED',
}

export interface ISDCError {
  code: ISDCErrorCode;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
}
