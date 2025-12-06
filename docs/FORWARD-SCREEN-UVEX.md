# Forward-Screen (Scing Chamber) UVEX Specification

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Owner:** Director Teon G Anderson  
**Project:** SCINGULAR Operating System (ScingOS)

---

## Table of Contents

1. [Philosophy & Vision](#philosophy--vision)
2. [The Infinite White Room](#the-infinite-white-room)
3. [Central Scing Entity](#central-scing-entity)
4. [Information Surfaces](#information-surfaces)
5. [Interaction Model](#interaction-model)
6. [State Machine & Transitions](#state-machine--transitions)
7. [Technical Implementation](#technical-implementation)
8. [Accessibility & Performance](#accessibility--performance)
9. [Animation Specifications](#animation-specifications)
10. [Integration Points](#integration-points)

---

## Philosophy & Vision

### Bona Fide Intelligence

The Forward-Screen is the **neutral home dimension** of ScingOS — an infinite, soft-white spatial room where Scing's presence, state, and intentions are always visible. This embodies **Bona Fide Intelligence** by making what Scing hears, thinks, and does **legible** instead of hiding it behind opaque UI.

**Core Principles:**
- **Visible Intelligence**: Every system state is shown, not hidden
- **Calm Presence**: The room is peaceful, not demanding
- **Honest Augmentation**: AI shows its work, users maintain agency
- **Return to Center**: All workflows begin and end here

### The Forward-Screen is NOT:
- A traditional desktop with icons
- An app launcher grid
- A notification center
- A window manager

### The Forward-Screen IS:
- A dimensional home state
- A companion presence
- A legible intelligence layer
- The user's calm command center

---

## The Infinite White Room

### Spatial Environment

**Core Aesthetics:**
- Horizon-less soft-white field (RGB: 250, 250, 252 / #FAFAFC)
- No visible boundaries or edges
- Subtle floor reflection (10% opacity, 2px blur)
- Gentle vignetting at viewport edges (radial gradient, 20% opacity)
- Volumetric haze for depth perception

**Depth Cues:**
```
Layer 1: Foreground - Central Entity (z-index: 100)
Layer 2: Current Session Cards (z-index: 80-90)
Layer 3: Background Sessions (z-index: 60-70, blur: 4px)
Layer 4: Room Environment (z-index: 0)
```

**Lighting Model:**
- Ambient diffuse light from above-forward (simulated)
- Soft shadows beneath entity and cards (blur: 8px, opacity: 15%)
- No harsh spotlights or directional beams

### Color System

**Primary Palette:**

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Scing Cyan** | #00A8E8 | 0, 168, 232 | Alive/connected/listening |
| **Signal Amber** | #FFA500 | 255, 165, 0 | Attention/approval needed |
| **Error Red** | #E74C3C | 231, 76, 60 | Serious blockers only |
| **Deep Midnight** | #1A1F36 | 26, 31, 54 | Rare overlays/framing |
| **Soft White** | #FAFAFC | 250, 250, 252 | Room base color |
| **Glass Frost** | #FFFFFF | 255, 255, 255 | Card material (80% opacity) |

**Color Usage Rules:**
1. **Never flood the room** with color — accents only
2. **Scing Cyan** appears at entity core, accent nodes, active card edges
3. **Signal Amber** flashes briefly for BANE gates, then settles into card edge
4. **Error Red** reserved for critical failures — use sparingly
5. **Deep Midnight** only for high-priority modal overlays

---

## Central Scing Entity

### Form & Material

**Base Geometry:**
- Semi-translucent 3D volume (liquid glass / plasma aesthetic)
- Loosely echoes ScingOS logo: **thick navy open circle with inward-rounded ends**
- Larger **orange accent dot** positioned at break in circle

**Material Properties:**
```glsl
// Simplified shader concept
uniform float transparency = 0.7;
uniform vec3 baseColor = vec3(0.0, 0.42, 0.91); // Navy blue
uniform vec3 accentColor = vec3(1.0, 0.65, 0.0); // Orange
uniform float glowIntensity = 0.3;
uniform float interferenceSpeed = 0.5;
```

**Physical Presence:**
- Diameter: 120px (desktop), 80px (mobile)
- Positioned: Center of viewport, vertically centered
- Depth: Appears to float 20px above floor plane

### Entity States

#### 1. Idle State

**Visual:**
- Slow breathing animation (scale: 0.98 → 1.02 → 0.98, duration: 4s, easing: ease-in-out)
- Surface interference patterns (traveling sine waves, speed: 0.5 units/s)
- Orange accent dot pulses gently (opacity: 0.7 → 1.0 → 0.7, duration: 2s)

**Shader Effects:**
- Ambient noise pattern scrolling across surface
- Subtle chromatic aberration at edges (±1px)

**Audio:**
- Optional: Soft ambient hum (40Hz, -30dB)

#### 2. Listening State

**Visual:**
- Entity leans toward user viewpoint (rotation: 0° → 3° on Y-axis, duration: 300ms)
- Radial ripples emanate from center, responding to microphone input levels
- Fine waveform band appears around entity's waist (height: 20px, color: Scing Cyan)
- Scing Cyan brightens at core (intensity: +40%)

**Animation:**
```javascript
// Microphone reactivity
micLevel = getAudioInputLevel(); // 0.0 to 1.0
rippleScale = 1.0 + (micLevel * 0.2);
waveformAmplitude = micLevel * 10; // pixels
```

**Caption:**
- Small text appears below entity: **"Listening..."** (12px, fade in 200ms)

**Audio:**
- Soft chime on wake (440Hz, 200ms, -20dB)

#### 3. Processing State

**Visual:**
- Bands of light orbit entity (3 bands, rotation: 360° per 2s)
- Inner particles follow helical paths (12 particles, spiral pattern)
- Particles color-coded by sub-engine:
  - **Blue**: LARI-VISION
  - **Green**: LARI-MAPPER
  - **Cyan**: LARI-GUARDIAN
  - **Purple**: BANE authentication
- Ultra-thin 360° halo progress ring appears for operations >2 seconds (stroke: 2px, color: Scing Cyan)

**Animation:**
```javascript
// Orbital bands
for (let i = 0; i < 3; i++) {
  band[i].rotation = (time + i * 120) % 360;
  band[i].opacity = 0.6;
}

// Helical particles
for (let particle of particles) {
  particle.angle = (time * 2 + particle.offset) % 360;
  particle.height = Math.sin(time + particle.offset) * 30;
  particle.radius = 70;
}
```

**Progress Ring:**
- Only appears after 2-second delay (prevents flicker on fast operations)
- Fills from 0° to 360° as operation completes
- Fades out over 300ms when complete

**Audio:**
- Subtle processing tone (white noise, -35dB, filtered 2kHz-4kHz)

#### 4. Speaking State

**Visual:**
- Pulses of light emanate from core in sync with speech syllables
- Each pulse travels outward from center to edge (radius: 0 → 100px, duration: 800ms)
- Pulses dissolve as they reach perimeter (opacity: 1.0 → 0.0)
- Accent nodes briefly flare when referencing external tools (LARI, BANE, devices)

**Animation Sync:**
```javascript
// Sync with text-to-speech syllables
onSyllable((syllable) => {
  createPulse({
    origin: entityCenter,
    radius: 0,
    targetRadius: 100,
    duration: 800,
    color: scingCyan,
    opacity: 1.0
  });
});
```

**Tool Reference Flares:**
- When Scing says "LARI is analyzing..." → Blue flare at accent node
- When Scing says "BANE requires approval..." → Amber flare at accent node
- Duration: 400ms flash, easing: ease-out-cubic

**Audio:**
- Voice output from text-to-speech engine

#### 5. Attention / Risk State (BANE)

**Visual:**
- Controlled, brief wash of Signal Amber or soft red along surface perimeter (never full-body)
- Wash duration: 600ms, then settles
- Single clear glyph appears above entity:
  - **Shield icon**: Security decision
  - **Key icon**: Authentication required
  - **Lock icon**: Data protection gate
- Glyph floats 40px above entity (fade in 200ms)
- After user interaction, glyph collapses into small audit icon on floating card

**Color Severity:**
- **Signal Amber**: Standard BANE gate (approval needed)
- **Error Red**: Critical security block (operation cannot proceed)

**Animation:**
```javascript
// Perimeter wash
perimeterWash({
  color: signalAmber,
  opacity: 0.0 → 0.6 → 0.2,
  duration: 600,
  easing: 'ease-in-out'
});

// Glyph appearance
glyphIcon.position.y = entityTop + 40;
glyphIcon.scale = 0.0 → 1.0;
glyphIcon.fadeIn(200);
```

**Audio:**
- Alert tone (dual tone: 800Hz + 1200Hz, 300ms, -15dB)

#### 6. Offline / Error State

**Visual:**
- Entity dims significantly (opacity: 0.7 → 0.3)
- Surface becomes matte (no reflections or interference patterns)
- Subtle red pulse at core (1s interval, opacity: 0.3 → 0.6 → 0.3)
- Orange accent dot turns gray

**Caption:**
- **"Reconnecting..."** or **"Offline"** appears below entity

**Audio:**
- Soft error tone (200Hz, 400ms, -25dB)

### State Transition Matrix

| From State | To State | Trigger | Duration |
|------------|----------|---------|----------|
| Idle | Listening | Wake word detected | 300ms |
| Listening | Processing | Command received | 200ms |
| Processing | Speaking | AI response ready | 300ms |
| Speaking | Idle | Speech complete | 400ms |
| Any | Attention | BANE gate triggered | 200ms |
| Attention | Processing | User approves | 300ms |
| Any | Offline | Connection lost | 500ms |
| Offline | Idle | Connection restored | 800ms |

---

## Information Surfaces

### Card Design System

**Material:**
- Frosted glass effect (`backdrop-filter: blur(20px)`)
- Background: `rgba(255, 255, 255, 0.8)`
- Border: 1px solid `rgba(0, 168, 232, 0.2)`
- Border radius: 12px
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.1)`

**Card Anatomy:**
```
┌─────────────────────────────┐
│ [Icon] Title          [×]   │ ← Header (color-coded edge)
├─────────────────────────────┤
│                             │
│   Content Area              │
│   (text, image, data)       │
│                             │
├─────────────────────────────┤
│        [Primary Action]     │ ← Footer (optional)
└─────────────────────────────┘
```

**Card Types:**

1. **Result Card** - Displays query results or AI responses
2. **Media Card** - Shows images, video, thermal scans
3. **Activity Card** - Lists current operations or logs
4. **Audit Card** - BANE approval requests or security events
5. **Session Card** - Historical session summaries

### Session Orbit System

**Layout:**
```
                    [Background Session]
                        (blur: 4px)
                            ↑
                            
    [Current Card]  ←  [ENTITY]  →  [Current Card]
         ↓                              ↓
    [Current Card]                 [Current Card]
```

**Positioning Rules:**
- **Current session**: Arc radius 200px from entity center, 0px blur
- **Background sessions**: Arc radius 400px from entity center, 4px blur
- **Maximum 5 cards** visible in current arc at once
- **Older cards** stack further back, increase blur incrementally

**Card Interaction:**
- **Voice pull**: *"Show me yesterday's inspection"* → Background card animates forward
- **Touch pull**: Tap/click background card → Moves to current arc
- **Dismiss**: Swipe away or voice command *"Close this"*

### SCINGULAR Mapping Sigil

**Position:** 20px below entity, centered

**Design:**
- Small monochrome logo (24px diameter)
- Text: "Powered by SCINGULAR AI" (8px, gray, opacity: 0.4)

**Behavior:**
- **Dim** (default): Opacity 0.4, no glow
- **Active** (when LARI/cloud invoked): Opacity 1.0, cyan glow (blur: 4px)
- **Transition**: 400ms fade

```javascript
// Activation trigger
onLARIInvoke(() => {
  sigil.opacity = 1.0;
  sigil.glow = 'cyan';
});

onLARIComplete(() => {
  setTimeout(() => {
    sigil.opacity = 0.4;
    sigil.glow = 'none';
  }, 1000);
});
```

---

## Interaction Model

### Input Hierarchy

**Primary (95%): Voice**
- Wake phrase: *"Hey Scing..."*
- Natural language commands
- Continuous conversation support
- Context retention across multi-turn dialogs

**Secondary (5%): Touch/Pointer**
- Card selection and dismissal
- BANE approval confirmations
- Media scrubbing (video, 3D models)
- Emergency fallback navigation

### Voice Interaction Flow

```
User says: "Hey Scing..."
    ↓
Wake word detected (Picovoice Porcupine)
    ↓
Entity → Listening State (visual feedback)
    ↓
User speaks command: "Start thermal scan"
    ↓
Speech-to-text (Web Speech API)
    ↓
Intent parsing (Genkit flow)
    ↓
Entity → Processing State
    ↓
AIP protocol routes to LARI-THERM
    ↓
BANE checks permissions (if needed → Attention State)
    ↓
Entity → Speaking State: "Starting thermal scan..."
    ↓
Result Card appears in current arc
    ↓
Entity → Idle State
```

### Context Awareness

**Thread Spine Indicator:**
- Thin vertical line behind entity (2px width, 80px height)
- Contains 0-3 lit nodes representing active tasks
- Node colors match task type (blue: analysis, amber: pending approval, green: complete)

**Activity Query:**
- User: *"What are you doing?"*
- Response: Activity card materializes showing:
  - Current operations list
  - Progress indicators
  - Estimated completion times
  - Source: BANE/AIP activity logs

### Touch/Pointer Gestures

| Gesture | Target | Action |
|---------|--------|--------|
| Tap/Click | Card | Select/focus |
| Swipe away | Card | Dismiss |
| Long press | Entity | Quick shortcuts menu |
| Drag | Card | Reorder in arc |
| Pinch | Card | Zoom (for images/3D) |
| Double-tap | Background | Return to idle |

---

## State Machine & Transitions

### Core State Definitions

```typescript
enum EntityState {
  IDLE = 'idle',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  SPEAKING = 'speaking',
  ATTENTION = 'attention',
  OFFLINE = 'offline'
}

interface StateConfig {
  visualEffects: VisualEffect[];
  audioEffects: AudioEffect[];
  transitionsTo: EntityState[];
  duration?: number; // If time-limited
}
```

### Event-Driven Transitions

**AIP Protocol Events:**
```typescript
// From AIP WebSocket
onAIPEvent('wake_word_detected', () => {
  transitionTo(EntityState.LISTENING);
});

onAIPEvent('command_received', () => {
  transitionTo(EntityState.PROCESSING);
});

onAIPEvent('response_ready', () => {
  transitionTo(EntityState.SPEAKING);
});

onAIPEvent('bane_gate_triggered', () => {
  transitionTo(EntityState.ATTENTION);
});

onAIPEvent('connection_lost', () => {
  transitionTo(EntityState.OFFLINE);
});
```

**Transition Guards:**
```typescript
// Prevent invalid transitions
function canTransition(from: EntityState, to: EntityState): boolean {
  const validTransitions = {
    [EntityState.IDLE]: [EntityState.LISTENING, EntityState.OFFLINE],
    [EntityState.LISTENING]: [EntityState.PROCESSING, EntityState.IDLE],
    [EntityState.PROCESSING]: [EntityState.SPEAKING, EntityState.ATTENTION, EntityState.OFFLINE],
    [EntityState.SPEAKING]: [EntityState.IDLE, EntityState.PROCESSING],
    [EntityState.ATTENTION]: [EntityState.PROCESSING, EntityState.IDLE],
    [EntityState.OFFLINE]: [EntityState.IDLE]
  };
  
  return validTransitions[from].includes(to);
}
```

---

## Technical Implementation

### Rendering Stack

**Core Technologies:**
- **Three.js** (r150+) for 3D rendering
- **React Three Fiber** (optional wrapper for React integration)
- **GLSL shaders** for entity material and effects
- **React** or **Svelte** for card UI layer
- **Framer Motion** for card animations

**Architecture:**
```
┌─────────────────────────────────────┐
│   UI Layer (Cards, Text, Buttons)   │ ← React/Svelte
├─────────────────────────────────────┤
│   3D Layer (Entity, Room, Effects)  │ ← Three.js
├─────────────────────────────────────┤
│   State Management (Entity State)   │ ← Zustand/Redux
├─────────────────────────────────────┤
│   AIP Protocol Client (WebSocket)   │ ← Custom WS client
├─────────────────────────────────────┤
│   Audio I/O (STT, TTS, Feedback)    │ ← Web Speech API
└─────────────────────────────────────┘
```

### Entity Renderer (Three.js)

```javascript
// Simplified Three.js setup
import * as THREE from 'three';

class ScingEntity {
  constructor(scene) {
    // Geometry: Torus to represent open circle
    const geometry = new THREE.TorusGeometry(60, 10, 32, 64);
    
    // Custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        state: { value: 0 }, // 0=idle, 1=listening, etc.
        baseColor: { value: new THREE.Color(0x001A3D) },
        accentColor: { value: new THREE.Color(0xFFA500) }
      },
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      transparent: true,
      opacity: 0.7
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
    
    // Orange accent dot
    const dotGeometry = new THREE.SphereGeometry(8, 32, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFA500,
      transparent: true 
    });
    this.accentDot = new THREE.Mesh(dotGeometry, dotMaterial);
    this.accentDot.position.set(0, 70, 0);
    this.mesh.add(this.accentDot);
  }
  
  setState(newState) {
    this.material.uniforms.state.value = newState;
    this.triggerTransition(newState);
  }
  
  update(deltaTime) {
    this.material.uniforms.time.value += deltaTime;
    this.updateAnimations(deltaTime);
  }
  
  triggerTransition(newState) {
    // Animate state change
    // (Implementation depends on state)
  }
}
```

### Card Renderer (React)

```jsx
import { motion } from 'framer-motion';

function Card({ type, title, content, position, onDismiss }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 168, 232, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        minWidth: '280px',
        maxWidth: '400px'
      }}
    >
      <div className="card-header">
        <h3>{title}</h3>
        <button onClick={onDismiss}>×</button>
      </div>
      <div className="card-content">
        {content}
      </div>
    </motion.div>
  );
}
```

### State Management

```typescript
// Using Zustand
import create from 'zustand';

interface ForwardScreenState {
  entityState: EntityState;
  cards: Card[];
  activeSession: string | null;
  threadSpine: TaskNode[];
  
  // Actions
  setEntityState: (state: EntityState) => void;
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  updateThreadSpine: (nodes: TaskNode[]) => void;
}

const useForwardScreen = create<ForwardScreenState>((set) => ({
  entityState: EntityState.IDLE,
  cards: [],
  activeSession: null,
  threadSpine: [],
  
  setEntityState: (state) => set({ entityState: state }),
  addCard: (card) => set((s) => ({ cards: [...s.cards, card] })),
  removeCard: (cardId) => set((s) => ({ 
    cards: s.cards.filter(c => c.id !== cardId) 
  })),
  updateThreadSpine: (nodes) => set({ threadSpine: nodes })
}));
```

### AIP Protocol Integration

```typescript
class ForwardScreenAIPClient {
  private ws: WebSocket;
  private stateManager: ForwardScreenState;
  
  connect() {
    this.ws = new WebSocket('wss://scingular.ai/aip');
    
    this.ws.on('message', (data) => {
      const event = JSON.parse(data);
      this.handleAIPEvent(event);
    });
  }
  
  handleAIPEvent(event: AIPEvent) {
    switch(event.type) {
      case 'wake_word_detected':
        this.stateManager.setEntityState(EntityState.LISTENING);
        break;
        
      case 'command_received':
        this.stateManager.setEntityState(EntityState.PROCESSING);
        break;
        
      case 'lari_invoked':
        this.highlightSCINGULARSigil();
        break;
        
      case 'bane_gate':
        this.stateManager.setEntityState(EntityState.ATTENTION);
        this.stateManager.addCard({
          type: 'audit',
          title: 'Approval Required',
          content: event.payload.message,
          approvalHandler: event.payload.handler
        });
        break;
        
      case 'response_ready':
        this.stateManager.setEntityState(EntityState.SPEAKING);
        this.stateManager.addCard({
          type: 'result',
          title: event.payload.title,
          content: event.payload.content
        });
        break;
    }
  }
  
  sendCommand(command: string) {
    this.ws.send(JSON.stringify({
      type: 'user_command',
      payload: { text: command }
    }));
  }
}
```

---

## Accessibility & Performance

### Accessibility Features

**Screen Reader Support:**
- All visual states have text equivalents
- Entity state announced via ARIA live regions
- Card content fully navigable via keyboard
- Alt text for all glyphs and icons

```html
<div role="status" aria-live="polite" aria-atomic="true">
  Scing is listening...
</div>
```

**Reduced Motion Mode:**
- Detects `prefers-reduced-motion` media query
- Disables:
  - Entity breathing animation
  - Orbital bands
  - Particle effects
  - Card slide animations
- Keeps:
  - State color changes
  - Text updates
  - Audio cues

```css
@media (prefers-reduced-motion: reduce) {
  .scing-entity {
    animation: none !important;
  }
  
  .card {
    transition: opacity 0.2s ease;
  }
}
```

**High Contrast Mode:**
- Increases border opacity on cards (0.2 → 0.6)
- Boosts accent colors by 20%
- Thicker strokes on glyphs (1px → 2px)

### Performance Tiers

**Full UVEX (Desktop / High-End Mobile):**
- 3D entity with fluid shaders
- Real-time particle systems
- Volumetric fog/haze
- Full card animations
- Target: 60 FPS

**Lite UVEX (Low-End Mobile / Power-Saving Mode):**
- 2D gradient entity (CSS-based)
- Simple pulsing rings (CSS animations)
- No particles or fog
- Reduced card animations
- Target: 30 FPS

**Auto-Detection:**
```javascript
function detectPerformanceTier() {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 2; // GB
  const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
  
  if (cores >= 4 && memory >= 4 && !isMobile) {
    return 'full';
  } else {
    return 'lite';
  }
}
```

**User Override:**
- Settings menu allows manual selection: Full / Lite
- Stored in localStorage

---

## Animation Specifications

### Timing & Easing

**Standard Durations:**
- **Micro**: 100ms (hover effects, button presses)
- **Short**: 200ms (state changes, card appearance)
- **Medium**: 400ms (entity transitions, glyph animations)
- **Long**: 800ms (complex sequences, offline recovery)

**Easing Functions:**
```css
--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--ease-in-out-back: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Entity Animations

**Idle Breathing:**
```css
@keyframes breathe {
  0%, 100% { transform: scale(0.98); }
  50% { transform: scale(1.02); }
}

.entity-idle {
  animation: breathe 4s ease-in-out infinite;
}
```

**Listening Lean:**
```javascript
// Three.js animation
entity.rotation.y = THREE.MathUtils.lerp(
  entity.rotation.y, 
  targetAngle, // 3 degrees toward user
  0.1 // Smooth interpolation
);
```

**Processing Orbit:**
```javascript
// Orbital bands
bands.forEach((band, index) => {
  band.rotation.z = (time * Math.PI + index * (Math.PI * 2 / 3)) % (Math.PI * 2);
});
```

### Card Animations

**Appear:**
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.8, y: 50 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ 
    duration: 0.3, 
    ease: [0.65, 0, 0.35, 1] 
  }}
/>
```

**Dismiss:**
```jsx
<motion.div
  exit={{ 
    opacity: 0, 
    scale: 0.8, 
    x: 200, // Slide off to side
    transition: { duration: 0.2 }
  }}
/>
```

**Pull Forward (from background):**
```jsx
<motion.div
  animate={{
    z: 0, // Bring to front
    filter: 'blur(0px)', // Remove blur
    scale: 1.1, // Slight enlarge
    transition: { duration: 0.4, ease: 'easeOutExpo' }
  }}
/>
```

---

## Integration Points

### AIP Protocol Events

**Inbound (from SCINGULAR AI):**

| Event | Payload | Triggers |
|-------|---------|----------|
| `wake_word_detected` | `{}` | Entity → Listening |
| `command_received` | `{ text: string }` | Entity → Processing |
| `lari_invoked` | `{ engine: string }` | Sigil glow, Processing state |
| `bane_gate` | `{ message: string, handler: string }` | Entity → Attention, Audit card |
| `response_ready` | `{ title: string, content: any }` | Entity → Speaking, Result card |
| `connection_lost` | `{}` | Entity → Offline |
| `connection_restored` | `{}` | Entity → Idle |

**Outbound (to SCINGULAR AI):**

| Event | Payload | Purpose |
|-------|---------|---------|
| `user_command` | `{ text: string, voice: boolean }` | Send user intent |
| `approval_granted` | `{ handler: string }` | BANE gate approval |
| `approval_denied` | `{ handler: string }` | BANE gate denial |
| `card_dismissed` | `{ cardId: string }` | Track user interaction |
| `session_started` | `{ sessionId: string }` | New workflow initiated |

### BANE Integration

**Approval Flow:**
1. SCINGULAR AI operation requires BANE approval
2. `bane_gate` event received
3. Entity → Attention state (amber wash, glyph appears)
4. Audit card materializes with approval request
5. User approves/denies via card button or voice
6. `approval_granted` or `approval_denied` sent to AIP
7. Entity resumes previous workflow or returns to idle

**Audit Trail:**
- Every user action logged to BANE
- Card interactions tracked
- Voice commands transcribed and signed
- Session lifecycle recorded

### LARI Sub-Engine Visualization

**Visual Indicators:**
- When LARI-VISION invoked: Blue particle stream
- When LARI-MAPPER invoked: Green particle stream
- When LARI-GUARDIAN invoked: Cyan particle stream
- Particles spiral into entity during processing
- SCINGULAR sigil glows during cloud AI call

**Card Content:**
- LARI results appear in specialized Result cards
- Image analysis shows bounding boxes on Media cards
- Compliance checks display in Activity cards with pass/fail badges

---

## Example Session Flow: Thermal Inspection

**Complete UVEX Walkthrough:**

1. **User:** *"Hey Scing, start thermal scan of north wall"*
   - **Entity:** IDLE → LISTENING (leans, cyan brightens, waveform ripples)
   - **Caption:** "Listening..." appears

2. **Speech processed, command parsed**
   - **Entity:** LISTENING → PROCESSING (orbital bands, helical particles)
   - **AIP:** Routes to LARI-THERM adapter
   - **SCINGULAR sigil:** Glows cyan

3. **Thermal camera activated**
   - **Media card materializes** showing live thermal feed
   - **Card position:** Current session arc, 200px from entity
   - **Particle stream:** Purple particles (device activation) flow into entity

4. **Hotspot detected by LARI-VISION**
   - **Blue particle burst** from entity
   - **Entity speaks:** *"Detecting hotspot at 2.5 meters. Capturing image. Should I log this?"*
   - **Entity:** PROCESSING → SPEAKING (pulses sync with syllables)

5. **User:** *"Yes, tag it as electrical hazard"*
   - **Entity:** SPEAKING → PROCESSING
   - **BANE gate triggered** (audit signature required)
   - **Entity:** PROCESSING → ATTENTION (amber wash, shield glyph appears)
   - **Audit card appears:** "Approve logging electrical hazard?"

6. **User taps "Approve" on card**
   - **AIP:** `approval_granted` sent
   - **Entity:** ATTENTION → PROCESSING
   - **BANE:** Signs event, writes WORM log
   - **Purple particles** (BANE activity) spiral into entity

7. **Operation complete**
   - **Media card updates:** Shows captured thermal image with annotation
   - **Audit icon** (small shield) appears on card edge
   - **Entity:** PROCESSING → SPEAKING
   - **Entity speaks:** *"Logged electrical hazard with audit signature."*
   - **SCINGULAR sigil:** Fades back to dim

8. **Return to idle**
   - **Entity:** SPEAKING → IDLE (breathing animation resumes)
   - **Cards persist** in current session arc for review
   - **Thread spine:** One green node (task complete)

---

## Future Enhancements

### Phase 2 (Q2 2026)

**Advanced Entity Morphing:**
- Entity shape adapts to context (e.g., expands into shield during BANE gate)
- Texture changes reflect workload intensity

**3D Spatial Audio:**
- Entity voice emanates from its 3D position
- Card audio (e.g., video playback) positioned spatially

**Hand Gesture Control:**
- Use device cameras for hand tracking
- Gesture vocabulary for card manipulation

### Phase 3 (Q4 2026)

**AR Mode:**
- Entity rendered in physical space via ARKit/ARCore
- Cards anchor to real-world surfaces
- Mixed reality inspection workflows

**Multi-User Collaboration:**
- Multiple users share same Forward-Screen session
- Entity shows combined state of all users' activities
- Collaborative card editing

**Emotional Intelligence:**
- Entity subtly reflects user sentiment (calm vs. urgent)
- Adaptive pacing based on stress detection

---

## Conclusion

The Forward-Screen (Scing Chamber) UVEX is the visual and experiential heart of ScingOS. It embodies the principles of **Bona Fide Intelligence**, **honest augmentation**, and **calm presence** that differentiate ScingOS from traditional operating systems and AI assistants.

By making intelligence **legible** and **present** rather than hidden and abstract, the Forward-Screen establishes a new paradigm for human-AI interaction — one where trust, agency, and clarity are paramount.

**Key Takeaways:**
- The infinite white room provides a neutral, calm home state
- The central Scing entity is a visible, responsive AI companion
- All system states are made legible through visual design
- Cards replace windows, voice replaces menus
- Every detail serves the principle of honest augmentation

This specification provides the technical foundation for implementing the Forward-Screen across all ScingOS platforms — from mobile devices to industrial equipment to future AR experiences.

---

**Document Version:** 1.0.0  
**Author:** Director Teon G Anderson (via AI Assistant)  
**Next Review:** Q1 2026  
**Related Documents:**
- `docs/SCING-UX.md` - Scing-Centric User Experience
- `docs/SCING-UX-TECHNICAL.md` - Technical Implementation
- `docs/SCING-UX-VISUAL-MOCKUPS.md` - Visual Design Details
- `docs/LARI-SOCIAL.md` - Social Governance Engine
- `docs/INTEGRATION_NEXTJS_FIREBASE.md` - Backend Integration

**Powered by SCINGULAR AI** 🟦🟠