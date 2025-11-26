# Integration Architecture: Next.js Firebase ↔ SCINGULAR OS

## Overview

This document details how **SCINGULAR OS** (thin-client portal) integrates with the existing **SCINGULAR AI platform** built on Next.js and Firebase. The integration enables seamless communication between the web-based backend and the OS client via the AIP protocol.

---

## Current SCINGULAR AI Platform

### Technology Stack
- **Frontend**: Next.js (React)
- **Backend**: Firebase (Cloud Functions, Firestore, Authentication)
- **Hosting**: Firebase Hosting
- **Storage**: Firebase Storage, Cloud Firestore
- **AI**: Google Cloud AI Platform, Gemini models

### Evolution
Originally designed as a web-based AI assistant for inspection fields, SCINGULAR AI has evolved into a comprehensive ecosystem, leading to the SCINGULAR OS concept.

---

## Integration Strategy

### High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│         SCINGULAR OS Clients                     │
│  (Phones, Tablets, Laptops, Industrial Devices)  │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │    AIP Protocol Client Module          │     │
│  │  - WebSocket connection                │     │
│  │  - Firebase Auth integration           │     │
│  │  - Capability token management         │     │
│  │  - Device I/O streaming                │     │
│  └─────────────┬──────────────────────────┘     │
└────────────────┼─────────────────────────────────┘
                 │
            AIP Protocol
       (WebSocket + REST/GraphQL)
                 │
┌────────────────▼─────────────────────────────────┐
│     SCINGULAR AI Backend (Next.js + Firebase)    │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Firebase Cloud Functions              │     │
│  │  - AIP WebSocket server                │     │
│  │  - REST API endpoints                  │     │
│  │  - GraphQL gateway (optional)          │     │
│  └───────────────┬────────────────────────┘     │
│                  │                               │
│  ┌───────────────▼────────────────────────┐     │
│  │  SCINGULAR AI Core Services            │     │
│  │  - LARI (analytics engines)            │     │
│  │  - Scing (conversational AI)           │     │
│  │  - BANE (security & auth)              │     │
│  │  - LARI-Social (social platform)       │     │
│  └───────────────┬────────────────────────┘     │
│                  │                               │
│  ┌───────────────▼────────────────────────┐     │
│  │  Firebase Services                     │     │
│  │  - Firestore (database)                │     │
│  │  - Cloud Storage (media)               │     │
│  │  - Firebase Auth (identity)            │     │
│  │  - Cloud Messaging (notifications)     │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Next.js Web UI (Progressive Web App)  │     │
│  │  - Dashboard, marketplace, help        │     │
│  │  - Embedded in SCINGULAR OS (optional) │     │
│  └────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

---

## API Layer Design

### 1. RESTful APIs

**Purpose**: CRUD operations, simple queries, legacy compatibility

**Implementation**:
- Firebase Cloud Functions with Express.js
- Firebase Hosting rewrites to route API calls
- Versioned endpoints (/api/v1/...)

**Example Endpoints**:
```
GET  /api/v1/inspections          # List inspections
GET  /api/v1/inspections/:id      # Get inspection details
POST /api/v1/inspections          # Create inspection
PUT  /api/v1/inspections/:id      # Update inspection
DEL  /api/v1/inspections/:id      # Delete inspection

GET  /api/v1/users/:id            # User profile
GET  /api/v1/reports/:id          # Inspection report
POST /api/v1/media/upload         # Upload media
```

---

### 2. WebSocket Endpoints (AIP Protocol)

**Purpose**: Real-time bidirectional communication for AI intelligence

**Implementation**:
- Firebase Cloud Functions with WebSocket upgrade
- Alternative: Separate Node.js server (Cloud Run)
- Socket.io or native WebSocket

**Connection Flow**:
```javascript
// Client-side (SCINGULAR OS)
const socket = new WebSocket('wss://api.scingular.ai/aip');

socket.onopen = () => {
  // Authenticate with Firebase token
  socket.send(JSON.stringify({
    type: 'auth',
    token: firebaseIdToken,
    deviceInfo: { /* ... */ }
  }));
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleAIPMessage(message);
};

// Server-side (Firebase Cloud Function)
exports.aipWebSocket = functions.https.onRequest((req, res) => {
  if (req.headers.upgrade === 'websocket') {
    // WebSocket upgrade handling
    handleWebSocketConnection(req, res);
  }
});
```

**Message Types**:
- `auth`: Authentication with Firebase token
- `command`: Voice/UI commands from Scing
- `stream`: Device sensor data streaming
- `intelligence`: AI analysis results
- `notification`: Push notifications
- `capability_request`: Request for BANE tokens

---

### 3. GraphQL Gateway (Optional)

**Purpose**: Flexible, efficient data fetching for complex queries

**Implementation**:
- Apollo Server in Firebase Cloud Functions
- Schema stitching for multiple data sources
- Real-time subscriptions via WebSocket

**Example Schema**:
```graphql
type Inspection {
  id: ID!
  address: String!
  client: User!
  inspector: User!
  findings: [Finding!]!
  media: [Media!]!
  createdAt: DateTime!
}

type Query {
  inspection(id: ID!): Inspection
  inspections(filter: InspectionFilter): [Inspection!]!
  user(id: ID!): User
}

type Mutation {
  createInspection(input: InspectionInput!): Inspection!
  updateInspection(id: ID!, input: InspectionInput!): Inspection!
}

type Subscription {
  inspectionUpdated(id: ID!): Inspection!
  newMessage(userId: ID!): Message!
}
```

---

## Authentication & Authorization

### Firebase Authentication Integration

**Flow**:
1. User logs into SCINGULAR OS
2. OS requests Firebase Auth (OAuth, email/password, phone)
3. Firebase returns ID token
4. OS sends token to AIP WebSocket for session establishment
5. Backend verifies token with Firebase Admin SDK
6. BANE generates capability tokens for authorized actions

**Implementation**:
```javascript
// Client-side (SCINGULAR OS)
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

// Use token for AIP authentication
aipConnection.authenticate(idToken);

// Server-side (Firebase Cloud Function)
import admin from 'firebase-admin';

async function verifyToken(idToken) {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return decodedToken.uid;
}
```

### BANE Token Generation

**Process**:
1. User action requires capability (e.g., `camera.capture`)
2. AIP client requests capability token from BANE
3. BANE validates user permissions via Firebase Custom Claims
4. BANE generates signed JWT with capability grant
5. Client uses token for action, backend verifies signature

**Example**:
```javascript
// Request capability
const token = await aipConnection.requestCapability('inspection.create');

// Use capability
const result = await createInspection(data, token);

// Server validates
const isValid = await bane.verifyCapabilityToken(token, 'inspection.create', userId);
```

---

## Push Notifications

### Firebase Cloud Messaging (FCM)

**Integration**:
- SCINGULAR OS clients register with FCM
- Receive device token, store in Firestore
- Backend sends notifications via Firebase Admin SDK

**Implementation**:
```javascript
// Client-side registration
import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();
const token = await getToken(messaging, { vapidKey: '...' });

// Send to backend
await updateUserDeviceToken(userId, token);

// Server-side sending
import admin from 'firebase-admin';

const message = {
  notification: {
    title: 'Inspection Complete',
    body: '3 issues found requiring attention'
  },
  token: deviceToken
};

await admin.messaging().send(message);
```

---

## Hybrid UI with Next.js Webviews

### Progressive Web App (PWA)

**Use Cases**:
- Marketplace browsing
- Complex dashboards
- Help documentation
- Settings management

**Implementation**:
```javascript
// SCINGULAR OS embeds Next.js pages
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://app.scingular.ai/marketplace' }}
  onMessage={(event) => handleWebMessage(event.nativeEvent.data)}
/>

// Bidirectional communication
// Next.js → OS
window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'navigate', to: '/home' }));

// OS → Next.js
webView.postMessage(JSON.stringify({ userData: {...} }));
```

---

## Versioning & Deployment

### Synchronized Releases

**Strategy**:
- Maintain version compatibility matrix
- AIP protocol version in all messages
- Graceful degradation for older clients
- Backward compatibility for at least 2 versions

**Version Headers**:
```json
{
  "protocolVersion": "2.0.0",
  "clientVersion": "1.5.2",
  "minServerVersion": "2.0.0"
}
```

### CI/CD Pipeline

**Firebase Deployment**:
```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Hosting (Next.js)
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

**SCINGULAR OS Updates**:
- AIP protocol pushes update notifications
- Client downloads new version in background
- Hot reload for minor updates
- Full restart for major updates

---

## Data Synchronization

### Firestore Realtime Listeners

**Client-side**:
```javascript
import { onSnapshot, doc } from 'firebase/firestore';

// Listen for inspection updates
const unsubscribe = onSnapshot(doc(db, 'inspections', inspectionId), (doc) => {
  const data = doc.data();
  updateLocalInspection(data);
});
```

### Offline Support

**Firestore Offline Persistence**:
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

await enableIndexedDbPersistence(db);
```

**Combined with LARI Hard-Engine**:
- Firestore handles basic data sync
- LARI Hard-Engine processes AI locally
- AIP protocol coordinates when both offline

---

## Security Best Practices

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Inspections
    match /inspections/{inspectionId} {
      allow read: if request.auth != null && 
        (resource.data.inspectorId == request.auth.uid || 
         resource.data.clientId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.inspectorId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.inspectorId == request.auth.uid;
    }
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### CORS Configuration

```javascript
// firebase.json
{
  "hosting": {
    "headers": [{
      "source": "/api/**",
      "headers": [{
        "key": "Access-Control-Allow-Origin",
        "value": "*"
      }]
    }]
  }
}
```

---

## Performance Optimization

### Caching Strategy

**Client-side**:
- Service Worker for static assets
- IndexedDB for inspection data
- In-memory cache for frequent queries

**Server-side**:
- Firebase Hosting CDN for Next.js pages
- Cloud Functions instance caching
- Firestore query result caching

### Connection Pooling

```javascript
// Reuse WebSocket connections
class AIPConnectionPool {
  constructor() {
    this.connections = new Map();
  }
  
  getConnection(userId) {
    if (!this.connections.has(userId)) {
      const conn = new WebSocket('wss://api.scingular.ai/aip');
      this.connections.set(userId, conn);
    }
    return this.connections.get(userId);
  }
}
```

---

## Migration Path

### Phase 1: Dual Operation (Current)
- Web platform continues as primary interface
- SCINGULAR OS connects as additional client
- Shared Firebase backend

### Phase 2: OS-First (Q2 2026)
- SCINGULAR OS becomes primary interface
- Web platform maintained for admin/complex tasks
- Progressive migration of user base

### Phase 3: Server Depot (Q4 2026)
- Evaluate owned infrastructure needs
- Plan migration from Firebase to dedicated servers
- Maintain backward compatibility with Firebase

---

## Testing Strategy

### Integration Tests

```javascript
describe('SCINGULAR OS ↔ Firebase Integration', () => {
  it('should authenticate via Firebase Auth', async () => {
    const token = await firebaseAuth.signIn(email, password);
    const session = await aipConnection.authenticate(token);
    expect(session.userId).toBeDefined();
  });
  
  it('should sync inspection data bidirectionally', async () => {
    const inspection = await createInspection(data);
    const synced = await waitForFirestoreUpdate(inspection.id);
    expect(synced).toEqual(inspection);
  });
});
```

---

## Monitoring & Observability

### Firebase Performance Monitoring

```javascript
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance();
const t = trace(perf, 'inspection_create');
t.start();
await createInspection(data);
t.stop();
```

### Error Tracking

```javascript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://...@sentry.io/...',
  integrations: [new Sentry.BrowserTracing()]
});
```

---

## Conclusion

This integration architecture enables seamless connection between SCINGULAR OS (thin-client portal) and the existing Next.js Firebase platform (cloud brain). The AIP protocol serves as the intelligent bridge, while Firebase provides robust authentication, data storage, and real-time synchronization capabilities.

Key benefits:
- Leverages existing Firebase investment
- Enables gradual migration to SCINGULAR OS
- Maintains web platform for flexibility
- Provides clear path to owned infrastructure
- Ensures backward compatibility and reliability

---

**SCINGULAR OS — Powered by Scing**  
*Connecting Intelligence Across Platforms*