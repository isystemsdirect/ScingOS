# LARI Hard-Engine: Offline Intelligence Layer

## Version: 2.0.0-alpha
**Branch:** feature/lari-hard-engine  
**Status:** In Development  
**Purpose:** Enable SCINGULAR OS to operate with full AI capabilities offline via local LARI processing

---

## Overview

The **LARI Hard-Engine** is a lightweight, on-device version of the LARI analytics federation that runs locally on SCINGULAR OS clients. It provides offline contingency when network connectivity is lost, ensuring users never lose progress and core AI functions remain operational.

### Key Principles

1. **Graceful Degradation**: Full cloud LARI capabilities online; essential LARI functions offline
2. **Automatic Sync**: All offline work syncs seamlessly when connection restored
3. **Progressive Enhancement**: Local models continuously updated from cloud when available
4. **Zero Data Loss**: All sensor data, photos, voice commands cached locally and processed when possible

---

## Architecture

### Hybrid Processing Model

```
┌─────────────────────────────────────────────────────┐
│           SCINGULAR OS Client Device                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │         LARI Hard-Engine (Local)              │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  LARI-VISION Lite                       │ │ │
│  │  │  - Basic defect detection               │ │ │
│  │  │  - Image classification (10 classes)    │ │ │
│  │  │  - Edge detection, crack analysis       │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  LARI-MAPPER Lite                       │ │ │
│  │  │  - Basic spatial tracking               │ │ │
│  │  │  - Room dimension estimation            │ │ │
│  │  │  - ARKit/ARCore integration             │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  LARI-GUARDIAN Lite                     │ │ │
│  │  │  - Safety threshold monitoring          │ │ │
│  │  │  - Critical alert detection             │ │ │
│  │  │  - Pattern matching (cached rules)      │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  LARI-NARRATOR Lite                     │ │ │
│  │  │  - Template-based reporting             │ │ │
│  │  │  - Local NLG (simple summaries)         │ │ │
│  │  │  - Cached report structures             │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  Local Data Cache                       │ │ │
│  │  │  - IndexedDB for structured data        │ │ │
│  │  │  - LocalStorage for preferences         │ │ │
│  │  │  - Service Worker for media caching     │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  Sync Queue Manager                     │ │ │
│  │  │  - Pending operations queue             │ │ │
│  │  │  - Conflict resolution                  │ │ │
│  │  │  - Priority-based sync                  │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│                    ↕ AIP Protocol                   │
│            (when network available)                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│         SCINGULAR AI Cloud (Full LARI)              │
│  - Complete LARI federation with all sub-engines    │
│  - Advanced ML models (Gemini, custom models)       │
│  - Historical data analysis                         │
│  - Cross-user insights                              │
└─────────────────────────────────────────────────────┘
```

---

## LARI Lite Sub-Engines

### LARI-VISION Lite

**Purpose:** On-device image analysis for inspections

**Capabilities (Offline):**
- Basic defect detection (cracks, water damage, corrosion)
- Image classification (10 common categories: structural, electrical, plumbing, etc.)
- Edge detection and measurement estimation
- Color analysis for mold/staining detection

**Technology Stack:**
- TensorFlow Lite or ONNX Runtime for mobile inference
- Quantized models (8-bit) for efficient processing
- Model size: ~20-50MB per specialized detector

**Limitations:**
- Reduced accuracy vs. cloud (85% vs 95%+)
- Limited to pre-trained categories
- No fine-grained classification
- Processing slower on low-end devices

**Implementation:**
```javascript
class LARIVisionLite {
  constructor() {
    this.model = null;
    this.initialized = false;
  }
  
  async initialize() {
    // Load quantized TFLite model
    this.model = await tf.loadLayersModel('indexeddb://lari-vision-lite');
    this.initialized = true;
  }
  
  async analyzeImage(imageData) {
    if (!this.initialized) await this.initialize();
    
    // Preprocess image
    const tensor = tf.browser.fromPixels(imageData)
      .resizeBilinear([224, 224])
      .expandDims(0)
      .div(255.0);
    
    // Run inference
    const predictions = await this.model.predict(tensor);
    const results = await predictions.data();
    
    // Post-process results
    return this.interpretResults(results);
  }
  
  interpretResults(rawResults) {
    // Map model output to inspection categories
    return {
      defectType: this.getTopClass(rawResults),
      confidence: Math.max(...rawResults),
      requiresCloudAnalysis: Math.max(...rawResults) < 0.7
    };
  }
}
```

---

### LARI-MAPPER Lite

**Purpose:** Basic spatial tracking and room mapping

**Capabilities (Offline):**
- ARKit/ARCore integration for spatial awareness
- Room dimension estimation
- Simple 3D mesh generation
- Object placement tracking

**Technology Stack:**
- Native ARKit (iOS) / ARCore (Android)
- WebXR for web-based clients
- Local SLAM (Simultaneous Localization and Mapping)

**Limitations:**
- No cloud-based point cloud merging
- Limited to single-room mapping sessions
- No historical comparison

---

### LARI-GUARDIAN Lite

**Purpose:** Safety monitoring with cached rule sets

**Capabilities (Offline):**
- Critical threshold monitoring (temperature, gas levels, etc.)
- Pattern matching against cached safety rules
- Immediate alerts for life-safety issues

**Rule Cache:**
```json
{
  "safetyRules": [
    {
      "id": "temp-threshold-fire",
      "condition": "temperature > 150F",
      "severity": "critical",
      "action": "immediate_alert"
    },
    {
      "id": "co-detection",
      "condition": "CO_ppm > 35",
      "severity": "critical",
      "action": "evacuate_warning"
    }
  ]
}
```

---

### LARI-NARRATOR Lite

**Purpose:** Basic report generation from templates

**Capabilities (Offline):**
- Template-based report assembly
- Simple natural language generation for summaries
- Markdown/PDF export

**Templates:**
- Pre-loaded inspection report templates (residential, commercial, etc.)
- Cached text generation patterns
- Variable substitution for common fields

---

## Offline Data Management

### Local Storage Strategy

**IndexedDB Schema:**
```javascript
const dbSchema = {
  inspections: {
    keyPath: 'id',
    indexes: ['timestamp', 'status', 'syncStatus']
  },
  media: {
    keyPath: 'id',
    indexes: ['inspectionId', 'type', 'uploadStatus']
  },
  lariAnalyses: {
    keyPath: 'id',
    indexes: ['mediaId', 'engineType', 'cloudVerified']
  },
  syncQueue: {
    keyPath: 'id',
    indexes: ['priority', 'timestamp', 'retryCount']
  }
};
```

**Storage Quotas:**
- Mobile: Target 500MB-1GB (request persistent storage)
- Tablet: 1-2GB
- Desktop: 5GB+

**Cache Management:**
- Automatic cleanup of old cached data (30 days+)
- Priority retention for unsynchronized work
- User-configurable storage limits

---

## Sync Strategy

### Connection State Detection

```javascript
class ConnectionManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.aipConnected = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  async handleOnline() {
    this.isOnline = true;
    
    // Test actual AIP connectivity (not just network)
    try {
      await aipProtocol.ping();
      this.aipConnected = true;
      await this.startSync();
    } catch (error) {
      console.warn('Network available but AIP unreachable');
      this.aipConnected = false;
    }
  }
  
  handleOffline() {
    this.isOnline = false;
    this.aipConnected = false;
    this.showOfflineIndicator();
  }
}
```

### Sync Queue Priority

**Priority Levels:**
1. **Critical**: Safety alerts, compliance data
2. **High**: Completed inspection reports
3. **Medium**: Media uploads (photos, videos)
4. **Low**: Analytics, non-essential metadata

**Sync Algorithm:**
```javascript
class SyncQueueManager {
  async processSyncQueue() {
    const queue = await this.getSortedQueue(); // By priority, then timestamp
    
    for (const item of queue) {
      try {
        await this.syncItem(item);
        await this.markSynced(item.id);
      } catch (error) {
        await this.handleSyncError(item, error);
      }
    }
  }
  
  async syncItem(item) {
    switch (item.type) {
      case 'inspection':
        return await this.syncInspection(item);
      case 'media':
        return await this.syncMedia(item);
      case 'lari_analysis':
        return await this.syncLARIAnalysis(item);
    }
  }
  
  async handleSyncError(item, error) {
    item.retryCount++;
    
    if (item.retryCount > 3) {
      // Flag for manual review
      await this.flagForManualSync(item);
    } else {
      // Exponential backoff
      const delay = Math.pow(2, item.retryCount) * 1000;
      setTimeout(() => this.syncItem(item), delay);
    }
  }
}
```

---

## Conflict Resolution

### Scenario: User edits report offline, cloud version updated by teammate

**Strategy: Last-Write-Wins with User Confirmation**

```javascript
async function resolveConflict(localVersion, cloudVersion) {
  // Show user both versions
  const userChoice = await showConflictDialog({
    local: localVersion,
    cloud: cloudVersion,
    options: ['keep_local', 'keep_cloud', 'merge']
  });
  
  switch (userChoice) {
    case 'keep_local':
      return await uploadLocalVersion(localVersion, { force: true });
    case 'keep_cloud':
      return await discardLocal(localVersion.id);
    case 'merge':
      return await attemptAutoMerge(localVersion, cloudVersion);
  }
}
```

---

## Model Updates

### Over-The-Air (OTA) Model Updates

**Process:**
1. Cloud pushes model update notification via AIP
2. Client downloads compressed model in background
3. Validates model signature (BANE cryptographic verification)
4. Swaps active model atomically
5. Tests new model on sample data
6. Rollback if validation fails

**Version Management:**
```javascript
const modelRegistry = {
  'lari-vision-lite': {
    currentVersion: '2.1.0',
    modelPath: 'indexeddb://lari-vision-lite-v2.1.0',
    checksum: 'sha256:abc123...',
    updateAvailable: '2.2.0',
    minDeviceRAM: 2048 // MB
  }
};
```

---

## User Experience

### Offline Indicator

**Visual Design:**
- Subtle banner at top: "Working Offline - Changes will sync when connected"
- Scing avatar color shift (blue → amber) to indicate offline mode
- Sync queue counter: "3 items pending upload"

**Voice Feedback:**
- Scing: "I'm working offline right now. Your data is safe and will sync when we reconnect."

### Capability Limitations

**Features Unavailable Offline:**
- Cloud LARI advanced analysis
- Real-time collaboration
- Historical data queries beyond local cache
- Social feed updates
- Marketplace access

**Graceful Degradation Messages:**
- User: "Hey Scing, compare this to last year's inspection"
- Scing: "I don't have access to historical data offline. I'll run that comparison when we reconnect."

---

## Performance Considerations

### Battery Impact
- Local ML inference is power-intensive
- Implement adaptive processing:
  - High quality mode (plugged in)
  - Balanced mode (>50% battery)
  - Power saver mode (<20% battery, minimal processing)

### Storage Management
- Proactive cleanup before running out of space
- Warn user if <100MB free space
- Option to offload cached data to external storage

### Processing Speed
- LARI Lite models optimized for mobile (quantized, pruned)
- Target: <2 seconds per image analysis
- Progressive results (quick preview, then refined analysis)

---

## Testing Strategy

### Offline Scenario Testing

```javascript
describe('Offline LARI Hard-Engine', () => {
  beforeEach(() => {
    simulateOfflineMode();
  });
  
  it('should analyze images locally when offline', async () => {
    const image = await captureTestImage();
    const result = await lariVisionLite.analyzeImage(image);
    
    expect(result.defectType).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.requiresCloudAnalysis).toBeDefined();
  });
  
  it('should queue data for sync when offline', async () => {
    await createInspection({ title: 'Test Offline' });
    const queue = await getSyncQueue();
    
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].syncStatus).toBe('pending');
  });
  
  it('should sync queued data when reconnected', async () => {
    await createInspection({ title: 'Test Sync' });
    
    simulateOnlineMode();
    await waitForSync();
    
    const queue = await getSyncQueue();
    expect(queue.length).toBe(0);
  });
});
```

---

## Roadmap

### Phase 1: Core Offline Capabilities (v2.0.0)
- LARI-VISION Lite basic defect detection
- Local data caching and sync queue
- Offline inspection creation

### Phase 2: Enhanced Local Processing (v2.1.0)
- LARI-MAPPER Lite AR integration
- LARI-GUARDIAN Lite safety monitoring
- Improved sync conflict resolution

### Phase 3: Advanced Offline Intelligence (v2.2.0)
- LARI-NARRATOR Lite report generation
- Local code/regulation lookup (cached)
- Federated learning (model improvements from offline usage)

### Phase 4: Edge Computing (v3.0.0)
- Distributed LARI processing across device mesh
- Peer-to-peer sync for team in same location
- Advanced on-device ML with neural engine acceleration

---

## Migration Notes

This feature branch (`feature/lari-hard-engine`) represents a major architectural enhancement. All previous work in `develop` branch is preserved. Once LARI Hard-Engine is stable and tested, it will be merged back into `develop` as version 2.0.0.

**Version History:**
- v1.0.0: Initial SCINGULAR OS architecture (cloud-only)
- v2.0.0: LARI Hard-Engine integration (offline capabilities)
- v3.0.0 (planned): Edge computing and distributed intelligence