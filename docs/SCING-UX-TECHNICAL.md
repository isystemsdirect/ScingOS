# Scing-Centric UX: Technical Implementation

## Overview
This document details the technical architecture and implementation requirements for the Scing-centric, voice-first user interface in SCINGULAR OS. It covers voice processing pipeline, UI rendering, state management, and integration with the AIP protocol and SCINGULAR AI backend.

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────┐
│         SCINGULAR OS Client Layer           │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Scing UI Controller                 │  │
│  │  - Avatar rendering engine           │  │
│  │  - Card/overlay manager              │  │
│  │  - Animation coordinator             │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │  Voice Input Pipeline                │  │
│  │  - Wake word detection (Picovoice)   │  │
│  │  - Speech-to-text (Web Speech API)   │  │
│  │  - Intent parser (local NLU)         │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
└─────────────────┼───────────────────────────┘
                  │
            AIP Protocol
         (Secure WebSocket)
                  │
┌─────────────────▼───────────────────────────┐
│       SCINGULAR AI Cloud Backend            │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Scing Intelligence (Genkit Flows)   │  │
│  │  - Command processing                │  │
│  │  - Context management                │  │
│  │  - Response generation               │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │  LARI (Analytics Engine)             │  │
│  │  - Vision, Mapper, Guardian, etc.    │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │  BANE (Security & Auth)              │  │
│  │  - Token validation                  │  │
│  │  - Capability authorization          │  │
│  │  - Audit logging                     │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Voice Input Pipeline

### Wake Word Detection

**Technology:** Picovoice Porcupine (on-device)

**Implementation:**
```javascript
// Initialize Porcupine wake word engine
const porcupine = await PorcupineWorker.create(
  accessKey: PICOVOICE_API_KEY,
  keywords: ['Hey Scing'],
  sensitivities: [0.7] // Adjust for accuracy vs false positives
);

// Listen for wake word
porcupine.onmessage = (event) => {
  if (event.data.isKeywordDetected) {
    activateListeningMode();
  }
};
```

**Features:**
- Low-power, always-on detection
- Privacy-preserving (no cloud upload until wake word detected)
- Customizable sensitivity threshold
- Offline capable

---

### Speech-to-Text

**Technology:** Web Speech API (primary), with fallback to cloud STT

**Implementation:**
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(result => result[0].transcript)
    .join('');
  
  updateUIWithTranscript(transcript);
  
  if (event.results[event.results.length - 1].isFinal) {
    processCommand(transcript);
  }
};

function activateListeningMode() {
  showListeningUI();
  recognition.start();
}
```

**Fallback for Offline:**
```javascript
if (!navigator.onLine) {
  // Use lightweight local STT model (limited vocabulary)
  const localSTT = await loadLocalSTTModel();
  // Process common commands offline
}
```

---

### Intent Parsing & Command Processing

**Local Pre-Processing:**
```javascript
function processCommand(transcript) {
  // Quick local intent detection for common commands
  const localIntents = {
    'show': /show (me )?(.*)/i,
    'open': /open (.*)/i,
    'start': /start (.*)/i,
    'capture': /capture|take (photo|picture|image)/i,
  };
  
  for (const [intent, pattern] of Object.entries(localIntents)) {
    const match = transcript.match(pattern);
    if (match) {
      // Execute simple commands locally for speed
      if (canExecuteLocally(intent)) {
        executeLocalCommand(intent, match);
        return;
      }
    }
  }
  
  // Send complex commands to Scing cloud for full NLU
  sendToScingIntelligence(transcript);
}
```

**Cloud Processing (Genkit Flow):**
```typescript
// Server-side Genkit flow for complex intent processing
export const processScingCommand = ai.defineFlow(
  {
    name: 'processScingCommand',
    inputSchema: z.object({
      userId: z.string(),
      deviceId: z.string(),
      transcript: z.string(),
      context: z.object({}) // Previous conversation state
    }),
    outputSchema: z.object({
      intent: z.string(),
      parameters: z.object({}),
      response: z.string(),
      actions: z.array(z.object({}))
    })
  },
  async (input) => {
    // Use Gemini for complex NLU
    const {output} = await ai.generate({
      model: gemini15Flash,
      prompt: `Parse this voice command: "${input.transcript}"
               User context: ${JSON.stringify(input.context)}
               Identify: intent, entities, required actions`,
    });
    
    // Validate permissions via BANE
    const authorized = await bane.checkCapability(
      input.userId,
      extractedIntent
    );
    
    if (!authorized) {
      return {
        intent: 'permission_denied',
        response: 'I don\'t have permission to do that.',
        actions: []
      };
    }
    
    // Execute authorized actions via LARI/other services
    const actions = await executeIntent(output, input.context);
    
    return {
      intent: extractedIntent,
      parameters: extractedParams,
      response: generateNaturalResponse(actions),
      actions: actions
    };
  }
);
```

---

## UI Rendering System

### Scing Avatar Component

**Technology:** Canvas API (2D) or Three.js (3D)

**2D Implementation (Lightweight):**
```javascript
class ScingAvatar {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'idle'; // idle, listening, processing, speaking, error
    this.animationFrame = 0;
  }
  
  render() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 40;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw based on state
    switch(this.state) {
      case 'idle':
        this.drawIdleState(centerX, centerY, radius);
        break;
      case 'listening':
        this.drawListeningState(centerX, centerY, radius);
        break;
      case 'processing':
        this.drawProcessingState(centerX, centerY, radius);
        break;
      case 'speaking':
        this.drawSpeakingState(centerX, centerY, radius);
        break;
    }
    
    requestAnimationFrame(() => this.render());
  }
  
  drawIdleState(x, y, r) {
    // Breathing animation
    const pulse = Math.sin(this.animationFrame * 0.02) * 0.1 + 1;
    const adjustedRadius = r * pulse;
    
    // Gradient fill
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, adjustedRadius);
    gradient.addColorStop(0, 'rgba(0, 168, 232, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 168, 232, 0.2)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, adjustedRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.animationFrame++;
  }
  
  drawListeningState(x, y, r) {
    // Waveform visualization synchronized with audio input
    const waveformData = this.getAudioLevels();
    
    this.ctx.strokeStyle = '#00A8E8';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    
    for (let i = 0; i < waveformData.length; i++) {
      const angle = (i / waveformData.length) * Math.PI * 2;
      const amplitude = waveformData[i] * 20;
      const waveX = x + Math.cos(angle) * (r + amplitude);
      const waveY = y + Math.sin(angle) * (r + amplitude);
      
      if (i === 0) this.ctx.moveTo(waveX, waveY);
      else this.ctx.lineTo(waveX, waveY);
    }
    
    this.ctx.closePath();
    this.ctx.stroke();
  }
  
  setState(newState) {
    this.state = newState;
  }
}
```

---

### Floating Card System

**Technology:** React/Flutter with CSS animations

**React Implementation:**
```jsx
import { motion, AnimatePresence } from 'framer-motion';

function FloatingCard({ id, type, content, position, onDismiss }) {
  return (
    <motion.div
      className="floating-card"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardHeader type={type} />
      <CardBody content={content} />
      <CardActions onDismiss={onDismiss} />
    </motion.div>
  );
}

function CardManager() {
  const [cards, setCards] = useState([]);
  
  // Listen for new cards from Scing intelligence
  useEffect(() => {
    const unsubscribe = aipProtocol.onCardCreate((cardData) => {
      setCards(prev => [...prev, cardData]);
    });
    return unsubscribe;
  }, []);
  
  return (
    <AnimatePresence>
      {cards.map(card => (
        <FloatingCard
          key={card.id}
          {...card}
          onDismiss={() => setCards(prev => prev.filter(c => c.id !== card.id))}
        />
      ))}
    </AnimatePresence>
  );
}
```

---

## State Management

### Client-Side State

**Technology:** Redux Toolkit or Zustand

```javascript
import create from 'zustand';

const useScingStore = create((set, get) => ({
  // Avatar state
  avatarState: 'idle',
  setAvatarState: (state) => set({ avatarState: state }),
  
  // Active cards
  cards: [],
  addCard: (card) => set(state => ({ cards: [...state.cards, card] })),
  removeCard: (id) => set(state => ({ 
    cards: state.cards.filter(c => c.id !== id) 
  })),
  
  // Conversation context
  conversationHistory: [],
  addToHistory: (message) => set(state => ({
    conversationHistory: [...state.conversationHistory, message]
  })),
  
  // Device capabilities
  availableCapabilities: [],
  setCapabilities: (caps) => set({ availableCapabilities: caps }),
  
  // Connection status
  isOnline: true,
  aipConnected: false,
  setConnectionStatus: (online, aipConnected) => set({ isOnline: online, aipConnected }),
}));
```

### Server-Side State (SCINGULAR AI)

**Session Management:**
```typescript
interface ScingSession {
  userId: string;
  deviceId: string;
  startTime: Date;
  conversationContext: ConversationContext;
  activeCapabilities: string[];
  stateData: Record<string, any>;
}

class SessionManager {
  private sessions: Map<string, ScingSession> = new Map();
  
  async createSession(userId: string, deviceId: string): Promise<string> {
    const sessionId = generateSessionId();
    
    // Get user capabilities from BANE
    const capabilities = await bane.getUserCapabilities(userId, deviceId);
    
    const session: ScingSession = {
      userId,
      deviceId,
      startTime: new Date(),
      conversationContext: {
        recentCommands: [],
        currentTask: null,
        userPreferences: await loadUserPreferences(userId)
      },
      activeCapabilities: capabilities,
      stateData: {}
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }
  
  async updateContext(sessionId: string, updates: Partial<ConversationContext>) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.conversationContext = { ...session.conversationContext, ...updates };
    }
  }
}
```

---

## AIP Protocol Integration

### WebSocket Connection

```javascript
class AIPConnection {
  constructor(serverUrl, authToken) {
    this.serverUrl = serverUrl;
    this.authToken = authToken;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);
      
      this.ws.onopen = () => {
        // Authenticate connection
        this.send({
          type: 'auth',
          token: this.authToken,
          deviceInfo: this.getDeviceInfo()
        });
        
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onerror = (error) => {
        console.error('AIP connection error:', error);
      };
      
      this.ws.onclose = () => {
        this.attemptReconnect();
      };
    });
  }
  
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection restored
      this.queueMessage(message);
    }
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'command_response':
        this.handleCommandResponse(message);
        break;
      case 'card_create':
        this.handleCardCreate(message);
        break;
      case 'capability_update':
        this.handleCapabilityUpdate(message);
        break;
      case 'notification':
        this.handleNotification(message);
        break;
    }
  }
  
  async attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
        this.connect();
      }, delay);
    }
  }
}
```

---

## Performance Optimization

### Voice Processing
- Use Web Workers for audio processing to avoid blocking main thread
- Implement voice activity detection (VAD) to reduce unnecessary processing
- Cache common command patterns for instant local execution

### UI Rendering
- Use hardware-accelerated CSS transforms for animations
- Implement virtual scrolling for large lists/galleries
- Lazy load card content as needed
- Use React.memo/useMemo to prevent unnecessary re-renders

### Network Optimization
- Implement request batching for multiple commands
- Use Protocol Buffers for efficient binary serialization
- Compress large payloads (images, videos) before transmission
- Implement aggressive caching with service workers

---

## Security Implementation

### Token-Based Authorization
```javascript
async function executeVoiceCommand(command) {
  // Request capability token from BANE
  const requiredCapability = inferCapability(command);
  
  try {
    const token = await aipConnection.requestCapability(requiredCapability);
    
    // Execute with valid token
    const result = await performAction(command, token);
    
    // Log action in BANE audit trail
    await aipConnection.logAudit({
      action: command,
      capability: requiredCapability,
      token: token,
      result: result,
      timestamp: new Date()
    });
    
    return result;
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      showPermissionError(requiredCapability);
    }
    throw error;
  }
}
```

---

## Testing Strategy

### Voice Input Testing
- Unit tests for intent parsing with diverse phrasings
- Integration tests with mock speech recognition
- Real-device testing across accents and environments

### UI Testing
- Visual regression testing for avatar states
- Animation performance profiling (60fps target)
- Accessibility testing (screen readers, voice output)

### End-to-End Testing
```javascript
describe('Voice Command Flow', () => {
  it('should complete inspection workflow hands-free', async () => {
    await mockVoiceInput('Hey Scing');
    expect(avatar.state).toBe('listening');
    
    await mockVoiceInput('start new inspection');
    await waitForResponse();
    expect(screen.getByText(/Inspection started/)).toBeVisible();
    
    await mockVoiceInput('capture photo');
    await waitForResponse();
    expect(mockCamera.capture).toHaveBeenCalled();
  });
});
```

---

This technical implementation guide provides the foundation for building the Scing-centric UX. Teams should adapt these patterns to their specific platform constraints and performance requirements.