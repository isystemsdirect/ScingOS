# ScingOS API Documentation

**REST API and WebSocket endpoints for ScingOS integrations**

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API](#rest-api)
4. [WebSocket API](#websocket-api)
5. [AIP Protocol](#aip-protocol)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [SDKs](#sdks)

---

## Overview

ScingOS provides two primary API interfaces:

1. **REST API** - For CRUD operations, data retrieval, and asynchronous tasks
2. **WebSocket API** - For real-time voice interactions and session management

All APIs require authentication and follow the **Augmented Intelligence Protocol (AIP)** specification.

**Base URLs**:
- **Production**: `https://api.scingos.com/v1`
- **Staging**: `https://api-staging.scingos.com/v1`
- **Development**: `http://localhost:5001/scingos-dev/us-central1`

---

## Authentication

### Firebase Authentication

All API requests require a valid Firebase ID token in the `Authorization` header.

**Getting a Token** (Client SDK):

```typescript
import { auth } from '@/lib/firebase';

const token = await auth.currentUser?.getIdToken();
```

**Request Header**:

```http
Authorization: Bearer <firebase-id-token>
```

**Token Expiration**: Tokens expire after 1 hour and must be refreshed.

---

## REST API

### Sessions

#### Create Session

**Endpoint**: `POST /sessions`

**Description**: Create a new ScingOS session.

**Request**:

```json
{
  "context": {
    "location": "123 Main St, City, ST",
    "project": "Inspection #12345",
    "metadata": {}
  }
}
```

**Response** (201 Created):

```json
{
  "id": "session_abc123",
  "user_id": "user_xyz789",
  "started_at": "2025-12-05T17:30:00Z",
  "last_activity": "2025-12-05T17:30:00Z",
  "context": { ... },
  "status": "active"
}
```

---

#### Get Session

**Endpoint**: `GET /sessions/:sessionId`

**Description**: Retrieve session details.

**Response** (200 OK):

```json
{
  "id": "session_abc123",
  "user_id": "user_xyz789",
  "started_at": "2025-12-05T17:30:00Z",
  "last_activity": "2025-12-05T18:00:00Z",
  "context": { ... },
  "status": "active",
  "tasks": [
    {
      "id": "task_123",
      "type": "inspection.capture_photo",
      "status": "completed"
    }
  ]
}
```

---

#### List Sessions

**Endpoint**: `GET /sessions`

**Query Parameters**:
- `limit` (number, default: 20, max: 100)
- `offset` (number, default: 0)
- `status` (string: "active" | "completed" | "archived")
- `since` (ISO 8601 timestamp)

**Response** (200 OK):

```json
{
  "sessions": [
    { ... }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Inspections

#### Create Inspection

**Endpoint**: `POST /inspections`

**Request**:

```json
{
  "property": {
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  },
  "type": "roofing",
  "metadata": {}
}
```

**Response** (201 Created):

```json
{
  "id": "inspection_abc123",
  "created_by": "user_xyz789",
  "created_at": "2025-12-05T17:30:00Z",
  "status": "in_progress",
  "property": { ... },
  "findings": []
}
```

---

#### Add Finding

**Endpoint**: `POST /inspections/:inspectionId/findings`

**Request**:

```json
{
  "category": "structural",
  "severity": "high",
  "description": "Foundation crack, 8mm wide",
  "code_reference": "IBC 1807.1.6",
  "photos": ["photo_url_1", "photo_url_2"],
  "voice_notes": ["audio_url_1"],
  "location": "East wall, foundation"
}
```

**Response** (201 Created):

```json
{
  "id": "finding_xyz",
  "inspection_id": "inspection_abc123",
  "created_at": "2025-12-05T17:45:00Z",
  "category": "structural",
  "severity": "high",
  "description": "Foundation crack, 8mm wide",
  "status": "open"
}
```

---

#### Generate Report

**Endpoint**: `POST /inspections/:inspectionId/reports`

**Request**:

```json
{
  "format": "pdf",
  "template": "standard",
  "include_photos": true,
  "include_codes": true
}
```

**Response** (202 Accepted):

```json
{
  "job_id": "report_job_123",
  "status": "processing",
  "estimated_completion": "2025-12-05T17:50:00Z"
}
```

**Poll for completion**:

`GET /reports/:jobId`

**Response when ready** (200 OK):

```json
{
  "id": "report_abc",
  "status": "completed",
  "download_url": "https://storage.scingos.com/reports/...",
  "expires_at": "2025-12-12T17:50:00Z"
}
```

---

### Tasks

#### Create Task

**Endpoint**: `POST /tasks`

**Request**:

```json
{
  "type": "inspection.plan",
  "parameters": {
    "inspection_type": "roofing",
    "property_size": "2500sqft"
  },
  "priority": "high"
}
```

**Response** (201 Created):

```json
{
  "id": "task_abc123",
  "type": "inspection.plan",
  "status": "pending",
  "created_at": "2025-12-05T17:30:00Z",
  "assigned_to": "lari-reasoning-engine"
}
```

---

## WebSocket API

### Connection

**Endpoint**: `wss://api.scingos.com/v1/ws`

**Authentication**: Send Firebase ID token as first message.

**Example** (JavaScript):

```javascript
const ws = new WebSocket('wss://api.scingos.com/v1/ws');

ws.onopen = () => {
  // Send auth token
  ws.send(JSON.stringify({
    type: 'auth',
    token: firebaseIdToken
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

---

### Messages

#### Voice Input

**Client → Server**:

```json
{
  "type": "voice.input",
  "session_id": "session_abc123",
  "audio": "<base64-encoded-audio>",
  "format": "webm",
  "sample_rate": 48000
}
```

**Server → Client**:

```json
{
  "type": "voice.transcription",
  "session_id": "session_abc123",
  "text": "Start a roofing inspection",
  "confidence": 0.98
}
```

---

#### Voice Output

**Server → Client**:

```json
{
  "type": "voice.output",
  "session_id": "session_abc123",
  "text": "Starting roofing inspection. First, let's check the shingles.",
  "audio": "<base64-encoded-audio>",
  "format": "mp3"
}
```

---

#### Task Updates

**Server → Client**:

```json
{
  "type": "task.update",
  "task_id": "task_abc123",
  "status": "completed",
  "result": { ... }
}
```

---

## AIP Protocol

All API messages follow the **Augmented Intelligence Protocol (AIP)** specification.

### Message Structure

```json
{
  "version": "1.0",
  "correlation_id": "uuid-v4",
  "timestamp": "ISO-8601",
  "sender": {
    "role": "human | agent | tool | governor",
    "id": "unique-identifier",
    "capabilities": []
  },
  "recipient": {
    "role": "human | agent | tool | governor",
    "id": "unique-identifier"
  },
  "payload": { ... },
  "security": {
    "capability_token": "<token>",
    "policy_context": { ... }
  }
}
```

See [AIP-PROTOCOL.md](./AIP-PROTOCOL.md) for full specification.

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... },
    "correlation_id": "uuid-v4"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Malformed request |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Rate Limiting

### Limits

| Tier | Requests/min | Burst | WebSocket Messages/min |
|------|--------------|-------|------------------------|
| Free | 60 | 10 | 120 |
| Pro | 600 | 100 | 1200 |
| Enterprise | Custom | Custom | Custom |

### Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1638360000
```

### Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "retry_after": 60
  }
}
```

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @scingos/sdk
```

```typescript
import { ScingOS } from '@scingos/sdk';

const client = new ScingOS({
  apiKey: process.env.SCINGOS_API_KEY,
  environment: 'production'
});

const session = await client.sessions.create({
  context: { location: '123 Main St' }
});
```

### Python

```bash
pip install scingos
```

```python
from scingos import ScingOS

client = ScingOS(api_key=os.environ['SCINGOS_API_KEY'])
session = client.sessions.create(context={'location': '123 Main St'})
```

---

## Resources

- [AIP Protocol Specification](./AIP-PROTOCOL.md)
- [Authentication Guide](./FIREBASE-INTEGRATION.md)
- [WebSocket Best Practices](https://socket.io/docs/v4/)
- [OpenAPI Specification](https://api.scingos.com/openapi.yaml)

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*