# ISDCProtocol2025 Specification

**ISD-Communications Protocol for Inspection Systems**

Version: 2025.1.0  
Last Updated: December 9, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Protocol Features](#protocol-features)
3. [Message Structure](#message-structure)
4. [Details Sync Functionality](#details-sync-functionality)
5. [Message Types](#message-types)
6. [Sync Workflow](#sync-workflow)
7. [Conflict Resolution](#conflict-resolution)
8. [Security & BANE Integration](#security--bane-integration)
9. [Implementation Examples](#implementation-examples)
10. [API Reference](#api-reference)

---

## Overview

The **ISDCProtocol2025** (ISD-Communications Protocol) is a standardized protocol for intelligent inspection workflows and real-time data synchronization across all Inspection Systems Direct platforms. It enables:

- **Bidirectional synchronization** of inspection data between client and server
- **Real-time updates** for inspection details, findings, and reports
- **Conflict detection and resolution** for offline/online scenarios
- **Version tracking** for all entities
- **Audit logging** integrated with BANE security layer
- **Cross-device synchronization** with persistent state

### Design Goals

1. **Reliable synchronization** for offline-first inspection workflows
2. **Conflict-aware** to handle concurrent edits
3. **Scalable** for large inspection datasets
4. **Secure** with BANE capability-based access control
5. **Efficient** bandwidth usage for mobile inspectors

---

## Protocol Features

### Transport Layer

- **Primary**: HTTPS with Firebase Cloud Functions
- **Encryption**: TLS 1.3
- **Authentication**: Firebase ID tokens
- **Message Format**: JSON

### Protocol Characteristics

- **Version**: 2025.1.0
- **Entity Types**: Inspections, Findings, Reports
- **Sync Modes**: Full, Incremental, Selective
- **Conflict Strategy**: Version-based conflict detection
- **Audit Trail**: All operations logged via BANE

---

## Message Structure

### Base Message Format

```json
{
  "protocol": "isdc",
  "version": "2025.1.0",
  "type": "details.sync",
  "id": "msg_uuid_v4",
  "timestamp": "2025-12-09T00:00:00.000Z",
  "session_id": "isdc_session_uuid",
  "sender": "client",
  "payload": { ... },
  "signature": "hmac_signature"
}
```

### Field Descriptions

- **protocol**: Always "isdc"
- **version**: Protocol version (e.g., "2025.1.0")
- **type**: Message type (see [Message Types](#message-types))
- **id**: Unique message ID (UUID v4)
- **timestamp**: ISO 8601 timestamp
- **session_id**: Session identifier
- **sender**: "client" or "server"
- **payload**: Type-specific message data
- **signature**: Optional HMAC signature for integrity

---

## Details Sync Functionality

The **details.sync** message type is the primary synchronization mechanism for inspection data.

### Details Sync Request

```json
{
  "type": "details.sync",
  "payload": {
    "sync_mode": "incremental",
    "entities": {
      "inspections": ["insp_123", "insp_456"],
      "findings": ["find_789"],
      "reports": []
    },
    "client_state": {
      "last_sync_timestamp": "2025-12-08T12:00:00.000Z",
      "local_versions": {
        "insp_123": 5,
        "insp_456": 3,
        "find_789": 2
      }
    },
    "options": {
      "include_media": true,
      "compress_data": false,
      "batch_size": 50
    }
  }
}
```

### Details Sync Response

```json
{
  "type": "sync.response",
  "payload": {
    "status": "success",
    "entities": [
      {
        "entity_type": "inspection",
        "entity_id": "insp_123",
        "operation": "update",
        "data": { ... },
        "version": 6,
        "timestamp": "2025-12-09T00:00:00.000Z"
      }
    ],
    "conflicts": [],
    "has_more": false
  }
}
```

### Sync Modes

1. **Full Sync**: Sync all entities for the user
   - Use for initial sync or after major data changes
   - Slower but guarantees complete synchronization

2. **Incremental Sync**: Sync entities modified since last sync
   - Use for regular periodic syncs
   - Efficient bandwidth usage

3. **Selective Sync**: Sync specific entities by ID
   - Use for on-demand syncs of specific inspections
   - Fastest for targeted updates

---

## Message Types

### Synchronization Messages

#### 1. `details.sync`

**Direction**: Client → Server

Primary sync operation for inspection details.

**Payload**: `DetailsSyncPayload`

#### 2. `sync.request`

**Direction**: Client → Server

Request entities modified since a timestamp.

```json
{
  "entity_type": "inspection",
  "since": "2025-12-08T12:00:00.000Z",
  "filters": {
    "status": "in_progress"
  }
}
```

#### 3. `sync.response`

**Direction**: Server → Client

Response with synchronized entities.

**Payload**: `SyncResponsePayload`

#### 4. `sync.update`

**Direction**: Server → Client (Push notification)

Real-time update notification for entity changes.

```json
{
  "entity_type": "finding",
  "entity_id": "find_123",
  "operation": "update",
  "data": { ... },
  "version": 4,
  "updated_by": "user_xyz",
  "updated_at": "2025-12-09T00:05:00.000Z"
}
```

### Entity Operations

#### 5. `inspection.create`

**Direction**: Client → Server

Create a new inspection.

```json
{
  "inspection": {
    "property": {
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zip": "62701"
    },
    "type": "roofing",
    "status": "draft",
    "inspector_id": "user_abc",
    "findings": [],
    "metadata": {}
  }
}
```

#### 6. `inspection.update`

**Direction**: Client → Server

Update an existing inspection.

#### 7. `finding.create` / `finding.update`

**Direction**: Client → Server

Create or update inspection findings.

#### 8. `conflict.resolution`

**Direction**: Client → Server

Resolve a detected sync conflict.

```json
{
  "conflict_id": "conflict_123",
  "resolution_strategy": "merge",
  "merged_data": { ... },
  "resolved_by": "user_abc",
  "resolved_at": "2025-12-09T00:10:00.000Z"
}
```

---

## Sync Workflow

### Standard Sync Flow

```
1. Client initiates sync
   ├─ Prepare local version map
   ├─ Select entities to sync
   └─ Send details.sync request
   ↓
2. Server processes request
   ├─ Authenticate and authorize
   ├─ Query entities from Firestore
   ├─ Detect version conflicts
   └─ Prepare sync response
   ↓
3. Client receives response
   ├─ Update local database
   ├─ Handle conflicts if any
   └─ Update sync status
```

### Conflict Detection Flow

```
1. Server compares versions
   ├─ local_version vs remote_version
   └─ If mismatch → Conflict detected
   ↓
2. Server includes conflict in response
   ├─ conflict_id generated
   ├─ Both versions provided
   └─ conflict_fields identified
   ↓
3. Client presents conflict to user
   ├─ Show both versions
   ├─ Allow manual resolution
   └─ Send resolution back to server
```

---

## Conflict Resolution

### Conflict Structure

```typescript
interface ConflictInfo {
  conflict_id: string;
  entity_type: 'inspection' | 'finding' | 'report';
  entity_id: string;
  local_version: number;
  remote_version: number;
  local_data: any;
  remote_data: any;
  conflict_fields: string[];
}
```

### Resolution Strategies

1. **Local Wins**: Keep local changes, discard remote
   - Use when user confirms their local changes are correct

2. **Remote Wins**: Discard local changes, accept remote
   - Use when remote changes are more recent or authoritative

3. **Merge**: Combine both changes intelligently
   - Use field-level merging for non-conflicting fields
   - Require manual resolution for conflicting fields

4. **Manual**: User manually edits to resolve
   - Use when automatic strategies are insufficient
   - Provide UI for side-by-side comparison

---

## Security & BANE Integration

### Capability-Based Authorization

All ISDCProtocol2025 operations require specific capabilities:

- `cap:sync.execute` - Execute sync operations
- `cap:inspection.create` - Create inspections
- `cap:inspection.update` - Update inspections
- `cap:finding.create` - Create findings
- `cap:finding.update` - Update findings

### Audit Logging

All operations are logged to Firestore audit_logs collection:

```json
{
  "protocol": "isdc",
  "version": "2025.1.0",
  "user_id": "user_abc",
  "action": "details.sync",
  "result": "success",
  "message": "Synced 5 entities",
  "timestamp": "2025-12-09T00:00:00.000Z"
}
```

### Security Decision Records (SDR)

High-privilege operations create SDRs via BANE:

```typescript
await createSecurityDecisionRecord({
  action: 'sync.execute',
  userId: 'user_abc',
  result: 'allowed',
  metadata: {
    sync_mode: 'incremental',
    entities_synced: 5,
    conflicts_detected: 0,
  },
});
```

---

## Implementation Examples

### Client-Side Usage

```typescript
import { createISDCClient } from '@/lib/isdc';

// Create client
const client = createISDCClient();

// Sync inspection details
const localVersions = {
  'insp_123': 5,
  'insp_456': 3,
};

const response = await client.syncDetails(
  {
    inspections: ['insp_123', 'insp_456'],
    findings: [],
  },
  localVersions,
  {
    sync_mode: 'incremental',
    include_media: true,
  }
);

// Handle response
if (response.status === 'success') {
  for (const entity of response.entities) {
    // Update local database
    await updateLocalEntity(entity);
  }
}

// Handle conflicts
if (response.conflicts && response.conflicts.length > 0) {
  for (const conflict of response.conflicts) {
    // Present to user for resolution
    const resolution = await presentConflictUI(conflict);
    
    // Resolve conflict
    await client.resolveConflict(
      conflict.conflict_id,
      resolution.strategy,
      resolution.mergedData,
      userId
    );
  }
}
```

### Create Inspection

```typescript
const result = await client.createInspection({
  property: {
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
  },
  type: 'roofing',
  status: 'draft',
  inspector_id: userId,
  findings: [],
});

console.log('Created inspection:', result.inspection_id);
```

### Update Finding

```typescript
await client.updateFinding({
  id: 'find_123',
  inspection_id: 'insp_456',
  category: 'structural',
  severity: 'high',
  description: 'Foundation crack detected',
  location: 'East wall',
  status: 'open',
  version: 2,
  // ... other fields
});
```

---

## API Reference

### Client Methods

#### `syncDetails(entities, localVersions, options)`

Sync inspection details with server.

**Parameters**:
- `entities`: Object with arrays of entity IDs to sync
- `localVersions`: Map of entity IDs to version numbers
- `options`: Sync options (mode, media, compression, batch size)

**Returns**: `Promise<SyncResponsePayload>`

#### `requestSync(entityType, since, filters)`

Request entities modified since timestamp.

**Parameters**:
- `entityType`: 'inspection' | 'finding' | 'report' | 'all'
- `since`: ISO 8601 timestamp (optional)
- `filters`: Additional filters (optional)

**Returns**: `Promise<SyncResponsePayload>`

#### `createInspection(inspection)`

Create a new inspection.

**Returns**: `Promise<{ status, inspection_id, version }>`

#### `updateInspection(inspection)`

Update an existing inspection.

**Returns**: `Promise<{ status, inspection_id, version }>`

#### `createFinding(finding)`

Create a new finding.

**Returns**: `Promise<{ status, finding_id, version }>`

#### `updateFinding(finding)`

Update an existing finding.

**Returns**: `Promise<{ status, finding_id, version }>`

#### `resolveConflict(conflictId, strategy, mergedData, userId)`

Resolve a sync conflict.

**Returns**: `Promise<{ status, conflict_id, resolution }>`

---

## Error Codes

| Code | Description | Recoverable |
|------|-------------|-------------|
| `ISDC_SYNC_CONFLICT` | Version conflict detected | Yes (resolve conflict) |
| `ISDC_VERSION_MISMATCH` | Protocol version incompatible | No |
| `ISDC_INVALID_ENTITY` | Entity data invalid | No |
| `ISDC_UNAUTHORIZED` | Authentication failed | No |
| `ISDC_SYNC_FAILED` | Sync operation failed | Yes (retry) |
| `ISDC_ENTITY_NOT_FOUND` | Entity not found | No |
| `ISDC_CAPABILITY_DENIED` | Missing required capability | No |

---

## Best Practices

1. **Sync Frequently**: Use incremental sync every 5-10 minutes for active inspections
2. **Offline Queue**: Queue operations when offline, sync when reconnected
3. **Version Tracking**: Always track entity versions locally
4. **Conflict UI**: Provide clear UI for conflict resolution
5. **Audit Trail**: Log all sync operations for debugging
6. **Batch Operations**: Use selective sync for large datasets
7. **Media Handling**: Upload media separately, sync metadata only

---

## Future Extensions

### Planned Features

- **Real-time Push**: WebSocket support for instant updates
- **Delta Sync**: Send only changed fields instead of full entities
- **Compression**: Automatic compression for large payloads
- **Encryption**: End-to-end encryption for sensitive data
- **Offline Cache**: Smart caching strategy for offline-first
- **Partial Sync**: Resume interrupted sync operations

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*
