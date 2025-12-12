# SCING Voice Interface Guide

**Natural Language Orchestrator for ScingOS**

---

## Table of Contents

1. [Overview](#overview)
2. [Voice-First Philosophy](#voice-first-philosophy)
3. [Architecture](#architecture)
4. [Wake Word Detection](#wake-word-detection)
5. [Speech Recognition](#speech-recognition)
6. [Natural Language Understanding](#natural-language-understanding)
7. [Response Generation](#response-generation)
8. [Text-to-Speech](#text-to-speech)
9. [Context Management](#context-management)
10. [User Experience Guidelines](#user-experience-guidelines)
11. [Implementation](#implementation)

---

## Overview

SCING (Speech-Controlled Intelligence Gateway) is the voice interface layer of ScingOS, serving as the primary mode of human-computer interaction. SCING enables users to interact with SCINGULAR AI services through natural, conversational voice commands.

### Key Capabilities

- **Wake word activation**: "Hey, Scing!"
- **Continuous listening**: Context-aware multi-turn conversations
- **Intent recognition**: Understanding user goals from natural language
- **Task orchestration**: Coordinating actions across LARI and BANE
- **Multimodal output**: Voice responses + visual feedback
- **Offline operation**: Cached responses for common queries

---

## Voice-First Philosophy

### Why Voice?

ScingOS is designed for **hands-free, eyes-free operation** in scenarios where:

- Users are working with tools or equipment
- Visual attention is needed elsewhere (e.g., inspections)
- Quick information access is critical
- Accessibility for users with visual or motor impairments

### Design Principles

1. **Conversational, not command-based**: Users speak naturally, not memorized commands
2. **Context-aware**: System remembers previous interactions
3. **Forgiving**: Handles accents, background noise, and partial input
4. **Efficient**: Minimizes back-and-forth; provides complete answers
5. **Transparent**: Clearly indicates what the system is doing

---

## Architecture

### SCING Pipeline

```
User Speech
    ↓
Wake Word Detection (on-device)
    ↓
Audio Recording
    ↓
Speech-to-Text (ASR)
    ↓
Natural Language Understanding (NLU)
    ↓
Intent Classification & Entity Extraction
    ↓
Task Orchestration (BANE authorization)
    ↓
LARI Execution (AI reasoning)
    ↓
Response Generation (NLG)
    ↓
Text-to-Speech (TTS)
    ↓
Audio Playback + Visual Display
```

### Component Responsibilities

| Component          | Responsibility               | Technology           |
| ------------------ | ---------------------------- | -------------------- |
| Wake Word Detector | Listens for "Hey, Scing!"    | Picovoice Porcupine  |
| Audio Capture      | Records user speech          | Web Audio API        |
| ASR                | Converts speech to text      | OpenAI Whisper       |
| NLU                | Extracts intent and entities | Fine-tuned LLM       |
| Dialog Manager     | Manages conversation state   | Custom state machine |
| Task Orchestrator  | Routes requests to LARI/BANE | AIP Protocol         |
| NLG                | Generates natural responses  | GPT-4                |
| TTS                | Synthesizes speech           | ElevenLabs           |
| Audio Playback     | Plays response audio         | Web Audio API        |

---

## Wake Word Detection

### Implementation

SCING uses **Picovoice Porcupine** for on-device wake word detection:

- **Wake phrase**: "Hey, Scing!"
- **Always listening**: Low-power continuous monitoring
- **Privacy-first**: Audio not sent to cloud until wake word detected
- **Custom model**: Trained specifically for "Scing" pronunciation

### Configuration

```typescript
import { PorcupineWorker } from '@picovoice/porcupine-web';

const porcupine = await PorcupineWorker.create(
  accessKey,
  [{ label: 'hey-scing', builtin: 'Hey Scing' }],
  (detection) => {
    if (detection.label === 'hey-scing') {
      console.log('Wake word detected!');
      startRecording();
    }
  }
);

await porcupine.start();
```

### Alternative Wake Methods

- **Button press**: Physical or on-screen button
- **Keyboard shortcut**: Spacebar or configurable key
- **Gesture**: Device shake or tap (mobile)

---

## Speech Recognition

### ASR Provider: OpenAI Whisper

**Why Whisper?**

- State-of-the-art accuracy
- Multilingual support (99 languages)
- Robust to background noise
- Handles accents and dialects

### Implementation

```typescript
import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en'); // or auto-detect

  const response = await openai.createTranscription(formData);
  return response.data.text;
}
```

### Audio Processing

- **Format**: WAV, 16kHz, mono
- **Max duration**: 30 seconds per request
- **Chunking**: Long recordings split into chunks
- **Noise reduction**: Pre-processing with WebRTC noise suppression

---

## Natural Language Understanding

### Intent Classification

SCING uses a **fine-tuned GPT-4 model** to extract user intent:

**Example Input**:  
`"Start a roofing inspection for the Smith property"`

**NLU Output**:

```json
{
  "intent": "start_inspection",
  "entities": {
    "inspection_type": "roofing",
    "property": "Smith property"
  },
  "confidence": 0.95
}
```

### Supported Intents

- `start_inspection`: Begin a new inspection
- `capture_image`: Take a photo
- `lookup_code`: Search building codes
- `generate_report`: Create inspection report
- `get_status`: Check inspection status
- `help`: Ask for assistance
- `cancel`: Cancel current operation

### Entity Extraction

Entities provide context for intents:

- **Inspection type**: roofing, electrical, plumbing, etc.
- **Location**: address, property name, GPS coordinates
- **Component**: shingles, wiring, pipes, etc.
- **Code reference**: IBC 1507, NFPA 70, etc.
- **Time**: tomorrow, next week, 3pm

---

## Response Generation

### Natural Language Generation (NLG)

SCING generates conversational responses using **GPT-4**:

**System Prompt**:

```
You are Scing, the voice assistant for ScingOS, an AI-powered inspection platform.
You are helpful, concise, and professional. You speak in a friendly tone.
Respond to the user based on the following context and task result.
```

**Example**:

**Context**:

```json
{
  "user": "Inspector John",
  "task": "start_inspection",
  "result": {
    "inspection_id": "insp_789",
    "type": "roofing",
    "checklist": ["shingles", "flashing", "vents"]
  }
}
```

**Generated Response**:  
`"Roofing inspection started, John. First, let's check the shingles. Say 'capture' when you're ready to take a photo."`

### Response Guidelines

- **Concise**: No more than 2-3 sentences per response
- **Actionable**: Tell the user what to do next
- **Confirmatory**: Repeat key details for verification
- **Error-friendly**: Explain errors in simple terms

---

## Text-to-Speech

### TTS Provider: ElevenLabs

**Why ElevenLabs?**

- Natural, expressive voices
- Low latency (< 1 second)
- Voice cloning capability
- Multilingual support

### Implementation

```typescript
import { ElevenLabsClient } from 'elevenlabs';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const audio = await elevenlabs.textToSpeech.convert({
    voice_id: 'scing_voice', // Custom Scing voice
    text,
    model_id: 'eleven_turbo_v2',
    output_format: 'mp3_44100_128',
  });

  return audio;
}
```

### Voice Characteristics

- **Tone**: Professional, friendly, reassuring
- **Pace**: Moderate (not too fast, not too slow)
- **Emphasis**: Key terms highlighted
- **Emotion**: Subtle, appropriate to context

---

## Context Management

### Session State

SCING maintains conversation context across multiple turns:

```typescript
interface ConversationContext {
  session_id: string;
  user_id: string;
  started_at: Date;
  last_activity: Date;

  // Current state
  current_inspection?: string;
  current_task?: string;

  // History (last 5 turns)
  history: Array<{
    user_input: string;
    scing_response: string;
    intent: string;
    timestamp: Date;
  }>;

  // Extracted entities
  entities: {
    property?: string;
    inspection_type?: string;
    location?: { lat: number; lng: number };
  };
}
```

### Context Resolution

SCING resolves ambiguous references:

**User**: "Start a roofing inspection"  
**Scing**: _remembers property from previous conversation_  
**Scing**: "Starting roofing inspection for the Johnson property on Main Street. Is that correct?"

---

## User Experience Guidelines

### Voice Interaction Patterns

#### Pattern 1: Simple Command

```
User: "Hey, Scing, what's the code for handrail height?"
Scing: "IBC Section 1014.8 requires handrails to be between 34 and 38 inches above the nosing."
```

#### Pattern 2: Multi-Step Task

```
User: "Hey, Scing, start an electrical inspection."
Scing: "Electrical inspection started. First, let's check the main panel. Say 'capture' when ready."
User: "Capture."
Scing: "Photo captured. Analyzing... I see a 200-amp panel with no visible issues. Next, check the GFCI outlets."
```

#### Pattern 3: Clarification

```
User: "Hey, Scing, generate a report."
Scing: "Which inspection would you like a report for? You have a roofing inspection and an electrical inspection in progress."
User: "The roofing one."
Scing: "Generating report for roofing inspection. I'll email it to you in about 30 seconds."
```

### Visual Feedback

While voice is primary, visual cues enhance UX:

- **Listening indicator**: Animated waveform
- **Processing indicator**: Spinner with status text
- **Results display**: Inspection checklist, codes, photos
- **Error messages**: Red banner with voice explanation

### Error Handling

**Speech not recognized**:

```
Scing: "Sorry, I didn't catch that. Could you repeat?"
```

**Ambiguous request**:

```
Scing: "I'm not sure what you mean by 'check it.' Could you be more specific?"
```

**System error**:

```
Scing: "I'm having trouble connecting to the server. Please try again in a moment."
```

---

## Implementation

### React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { useScing } from '@/lib/scing';

export function VoiceInterface() {
  const { isListening, transcript, response, speak } = useScing();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Start wake word detection on mount
    startWakeWordDetection();
  }, []);

  return (
    <div className="voice-interface">
      {isListening && (
        <div className="listening-indicator">
          <WaveformAnimation />
          <p>Listening...</p>
        </div>
      )}

      {transcript && (
        <div className="transcript">
          <p><strong>You:</strong> {transcript}</p>
        </div>
      )}

      {response && (
        <div className="response">
          <p><strong>Scing:</strong> {response}</p>
        </div>
      )}

      <button
        className="voice-button"
        onClick={() => speak('Hey, Scing!')}
      >
        <MicrophoneIcon />
        Tap to Speak
      </button>
    </div>
  );
}
```

---

## Future Enhancements

- **Voice biometrics**: Speaker identification for security
- **Emotion detection**: Adapt responses to user emotion
- **Multilingual**: Support for Spanish, Mandarin, etc.
- **Offline mode**: On-device speech recognition
- **Custom wake words**: User-defined activation phrases

---

## Summary

SCING transforms ScingOS into a truly voice-first platform, enabling natural, hands-free interaction with SCINGULAR AI services. By combining wake word detection, advanced ASR/NLU, and contextual responses, SCING delivers a seamless conversational experience.

---

_For code examples, see `/client/components/voice/`_

_For voice model configuration, see `/docs/voice-models.md`_

---

_Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC_
