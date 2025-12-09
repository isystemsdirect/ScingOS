# AIP Protocol Specification

**Augmented Intelligence Portal Communication Protocol**

---

## Table of Contents

1. [Overview](#overview)
2. [Protocol Features](#protocol-features)
3. [Connection Model](#connection-model)
4. [Message Format](#message-format)
5. [Message Types](#message-types)
6. [Authentication Flow](#authentication-flow)
7. [Security](#security)
8. [Error Handling](#error-handling)
9. [Implementation Examples](#implementation-examples)

---

## Overview

The **Augmented Intelligence Portal (AIP) Protocol** is a proprietary, real-time communication protocol designed specifically for ScingOS to communicate with SCINGULAR AI cloud services. It enables:

- **Low-latency** bidirectional communication
- **Secure** authenticated channels
- **Stateful** session management
- **Reliable** message delivery with acknowledgments
- **Extensible** protocol versioning

### Design Goals

1. **Real-time responsiveness** for voice interactions
2. **Security-first** with zero-trust principles
3. **Resilient** to network interruptions
4. **Efficient** bandwidth usage
5. **Observable** for debugging and monitoring

---

## Protocol Features

### Transport Layer

- **Primary**: WebSocket (wss://)
- **Fallback**: HTTPS long-polling
- **Encryption**: TLS 1.3
- **Port**: 443 (standard HTTPS/WSS)

### Protocol Version

- **Current**: v1.0
- **Negotiation**: Client specifies version in initial handshake
- **Backward compatibility**: Server supports multiple versions

### Message Characteristics

- **Format**: JSON
- **Encoding**: UTF-8
- **Compression**: gzip (optional, negotiated)
- **Max message size**: 10 MB
- **Framing**: Length-prefixed for binary data

---

## Connection Model

### Connection Lifecycle

```
1. Client initiates WebSocket connection
   ↓
2. TLS handshake
   ↓
3. Protocol version negotiation
   ↓
4. Authentication (token exchange)
   ↓
5. Session established
   ↓
6. Message exchange (bidirectional)
   ↓
7. Heartbeat maintenance
   ↓
8. Session termination (clean close or timeout)
```

### Connection States

- **CONNECTING**: Establishing connection
- **AUTHENTICATING**: Exchanging credentials
- **CONNECTED**: Active session
- **RECONNECTING**: Attempting to restore session
- **DISCONNECTED**: Connection closed
- **ERROR**: Fatal error occurred

### Reconnection Strategy

- **Automatic reconnection** with exponential backoff
- **Initial delay**: 1 second
- **Max delay**: 30 seconds
- **Max attempts**: 5
- **Session recovery**: Resume from last acknowledged message

---

## Message Format

### Base Message Structure

```json
{
  "protocol": "aip",
  "version": "1.0",
  "type": "message_type",
  "id": "unique_message_id",
  "timestamp": "2025-12-04T18:00:00.000Z",
  "session_id": "session_uuid",
  "sender": "client" | "server",
  "payload": { ... },
  "signature": "hmac_signature"
}
```

### Field Descriptions

- **protocol**: Always "aip"
- **version**: Protocol version (e.g., "1.0")
- **type**: Message type identifier
- **id**: Unique message ID (UUID v4)
- **timestamp**: ISO 8601 timestamp
- **session_id**: Session identifier
- **sender**: "client" or "server"
- **payload**: Type-specific message data
- **signature**: HMAC-SHA256 signature for integrity

---

## Message Types

### 1. Authentication Request

**Direction**: Client → Server

```json
{
  "type": "auth.request",
  "payload": {
    "token": "firebase_id_token",
    "device_id": "device_uuid",
    "client_version": "0.1.0",
    "capabilities": ["voice", "camera", "location"]
  }
}
```

### 2. Authentication Response

**Direction**: Server → Client

```json
{
  "type": "auth.response",
  "payload": {
    "status": "success" | "failed",
    "session_id": "session_uuid",
    "user_id": "firebase_uid",
    "expires_at": "2025-12-04T19:00:00.000Z",
    "capabilities_granted": ["voice", "camera"]
  }
}
```

### 3. Task Request

**Direction**: Client → Server

```json
{
  "type": "task.request",
  "payload": {
    "action": "camera.capture",
    "params": {
      "resolution": "high",
      "flash": false
    },
    "capabilities": ["cap:camera.read"],
    "context": {
      "inspection_id": "insp_123",
      "location": { "lat": 40.7128, "lng": -74.0060 }
    }
  }
}
```

### 4. Task Response

**Direction**: Server → Client

```json
{
  "type": "task.response",
  "payload": {
    "request_id": "original_request_id",
    "status": "success" | "failed" | "denied",
    "result": {
      "image_url": "https://storage.../image.jpg",
      "metadata": { ... }
    },
    "sdr_id": "security_decision_record_id",
    "error": null
  }
}
```

### 5. Event Notification

**Direction**: Server → Client (or vice versa)

```json
{
  "type": "event.notification",
  "payload": {
    "event": "inspection.completed",
    "data": {
      "inspection_id": "insp_123",
      "status": "passed",
      "report_url": "https://storage.../report.pdf"
    }
  }
}
```

### 6. Context Update

**Direction**: Bidirectional

```json
{
  "type": "context.update",
  "payload": {
    "updates": {
      "current_inspection": "insp_123",
      "location": { "lat": 40.7128, "lng": -74.0060 },
      "battery_level": 75
    }
  }
}
```

### 7. Heartbeat

**Direction**: Bidirectional

```json
{
  "type": "heartbeat",
  "payload": {
    "client_time": "2025-12-04T18:00:00.000Z"
  }
}
```

**Response**:
```json
{
  "type": "heartbeat.ack",
  "payload": {
    "server_time": "2025-12-04T18:00:00.100Z",
    "latency_ms": 100
  }
}
```

### 8. Error Message

**Direction**: Bidirectional

```json
{
  "type": "error",
  "payload": {
    "code": "CAPABILITY_DENIED",
    "message": "User does not have camera access permission",
    "request_id": "original_request_id",
    "recoverable": false
  }
}
```

---

## Authentication Flow

### Initial Authentication

```
1. Client obtains Firebase ID token
   ↓
2. Client sends auth.request with token
   ↓
3. Server validates token with Firebase Auth
   ↓
4. Server checks user permissions via BANE
   ↓
5. Server creates session and issues session_id
   ↓
6. Server sends auth.response with session_id
   ↓
7. Client stores session_id for all subsequent messages
```

### Token Refresh

- Firebase tokens expire after 1 hour
- Client automatically refreshes token in background
- New token sent via `auth.refresh` message
- Session remains active during token refresh

### Session Expiration

- Sessions expire after **4 hours** of inactivity
- Client receives `session.expired` event
- Client must re-authenticate to continue

---

## Security

### Encryption

- **Transport**: TLS 1.3 with perfect forward secrecy
- **Message integrity**: HMAC-SHA256 signature on every message
- **Payload encryption**: Sensitive data encrypted with AES-256-GCM

### Authentication

- **Firebase ID tokens**: Validated on every connection
- **Session tokens**: Short-lived, rotated every hour
- **Device binding**: Sessions bound to specific device IDs

### Authorization

- **Capability-based**: Every action requires explicit capability token
- **BANE validation**: All requests pass through BANE security layer
- **Audit logging**: Every privileged action logged with SDR

### Rate Limiting

- **Per user**: 1000 messages per minute
- **Per session**: 100 messages per second
- **Burst allowance**: 200 messages

### Threat Protection

- **DDoS protection**: Automatic rate limiting and IP blocking
- **Message validation**: Schema validation on all messages
- **Size limits**: Max 10 MB per message
- **Replay protection**: Message IDs tracked, duplicates rejected

---

## Error Handling

### Error Codes

| Code | Description | Recoverable |
|------|-------------|-------------|
| `AUTH_FAILED` | Authentication failed | No |
| `SESSION_EXPIRED` | Session has expired | Yes (re-auth) |
| `INVALID_MESSAGE` | Message format invalid | No |
| `CAPABILITY_DENIED` | Action not authorized | No |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Yes (backoff) |
| `SERVER_ERROR` | Internal server error | Yes (retry) |
| `NETWORK_ERROR` | Network connectivity issue | Yes (reconnect) |
| `TIMEOUT` | Request timed out | Yes (retry) |

### Error Response Format

```json
{
  "type": "error",
  "payload": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "request_id": "original_request_id",
    "recoverable": true,
    "retry_after_ms": 5000,
    "details": { ... }
  }
}
```

### Client Error Handling Strategy

1. **Parse error code**
2. **Check if recoverable**
3. **If recoverable**:
   - Wait `retry_after_ms`
   - Retry with exponential backoff
4. **If not recoverable**:
   - Display error to user
   - Log to error tracking service
   - Transition to error state

---

## Implementation Examples

### Client Connection (TypeScript)

```typescript
import { io, Socket } from 'socket.io-client';
import { auth } from './firebase';

class AIPClient {
  private socket: Socket | null = null;
  private sessionId: string | null = null;

  async connect(): Promise<void> {
    // Get Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const idToken = await user.getIdToken();

    // Connect to AIP endpoint
    this.socket = io('wss://api.scingular.ai/v1/aip', {
      transports: ['websocket'],
      auth: { token: idToken },
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Connected to AIP');
      this.authenticate(idToken);
    });

    this.socket.on('auth.response', (data) => {
      if (data.payload.status === 'success') {
        this.sessionId = data.payload.session_id;
        console.log('Authenticated successfully');
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from AIP');
      this.sessionId = null;
    });
  }

  private authenticate(token: string): void {
    this.socket?.emit('message', {
      protocol: 'aip',
      version: '1.0',
      type: 'auth.request',
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sender: 'client',
      payload: {
        token,
        device_id: this.getDeviceId(),
        client_version: '0.1.0',
        capabilities: ['voice', 'camera'],
      },
    });
  }

  async sendTask(action: string, params: any): Promise<any> {
    if (!this.sessionId) throw new Error('Not authenticated');

    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();

      this.socket?.emit('message', {
        protocol: 'aip',
        version: '1.0',
        type: 'task.request',
        id: requestId,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        sender: 'client',
        payload: { action, params },
      });

      // Wait for response
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);

      this.socket?.once(`response.${requestId}`, (response) => {
        clearTimeout(timeout);
        if (response.payload.status === 'success') {
          resolve(response.payload.result);
        } else {
          reject(new Error(response.payload.error));
        }
      });
    });
  }

  private getDeviceId(): string {
    // Get or generate device ID
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }
}

export const aipClient = new AIPClient();
```

---

## Protocol Versioning

### Version Negotiation

Client specifies supported versions in initial handshake:

```json
{
  "type": "hello",
  "payload": {
    "supported_versions": ["1.0", "1.1"]
  }
}
```

Server responds with selected version:

```json
{
  "type": "hello.ack",
  "payload": {
    "version": "1.0"
  }
}
```

### Version Compatibility

- **Major version change**: Breaking changes, clients must upgrade
- **Minor version change**: Backward compatible, optional features
- **Patch version**: Bug fixes, transparent to clients

---

## Future Extensions

### Planned Features

- **Binary message support**: For efficient media transfer
- **Stream multiplexing**: Multiple concurrent streams per connection
- **Priority queuing**: High-priority messages bypass queue
- **Compression negotiation**: Client-server negotiate compression
- **Offline queuing**: Messages queued when offline, sent on reconnect

---

## Summary

The AIP Protocol provides a robust, secure, and efficient communication channel between ScingOS clients and SCINGULAR AI services. Its design prioritizes:

✅ **Low latency** for real-time voice interactions  
✅ **Strong security** with zero-trust principles  
✅ **Reliability** through acknowledgments and reconnection  
✅ **Extensibility** via versioning and modular message types  

---

## Related Protocols

### ISDCProtocol2025

For inspection-specific data synchronization and workflow management, see [ISDCProtocol2025](./ISDC-PROTOCOL-2025.md). This protocol extends AIP with:

- **Bidirectional sync** for inspection details, findings, and reports
- **Conflict detection** and resolution for offline/online scenarios  
- **Version tracking** for all inspection entities
- **BANE integration** for audit and security

ISDCProtocol2025 (ISD-Communications Protocol) is the standardized protocol for all Inspection Systems Direct workflows.

---

*For implementation details, see the client library in `/client/lib/aip/`*

*For server implementation, see Cloud Functions in `/cloud/functions/aip/`*

*For ISDCProtocol2025, see `/client/lib/isdc/` and `/cloud/functions/src/isdc/`*

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*