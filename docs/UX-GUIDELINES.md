# ScingOS UX Guidelines

**Voice-First Interface Design Principles**

---

## Table of Contents

1. [Overview](#overview)
2. [Voice-First Principles](#voice-first-principles)
3. [Conversation Design](#conversation-design)
4. [Visual Design](#visual-design)
5. [Accessibility](#accessibility)
6. [Error Handling](#error-handling)
7. [Performance](#performance)

---

## Overview

ScingOS is designed as a **voice-first** operating system where voice is the primary input method and visual interfaces serve as secondary support. This document outlines the UX principles and patterns that ensure a seamless, intuitive experience.

---

## Voice-First Principles

### 1. Voice is Primary, Visual is Secondary

**Principle**: Users should be able to complete tasks entirely through voice, with visual elements providing context and confirmation.

**Guidelines**:

- All core functionality must be accessible via voice
- Visual elements should reinforce, not replace, voice interactions
- Screen should show current state, not require constant attention
- Assume user is hands-free and may not be looking at screen

**Example**:

```
✅ GOOD:
Scing: "Roofing inspection started. First, let's check the shingles.
       Say 'capture' when ready for a photo."
Screen: Shows current inspection step visually

❌ BAD:
Scing: "Inspection started."
Screen: Shows complex menu requiring visual navigation
```

---

### 2. Conversational, Not Command-Based

**Principle**: Users speak naturally, not memorized commands.

**Guidelines**:

- Accept varied phrasings for same intent
- Handle incomplete or ambiguous requests gracefully
- Never require exact command syntax
- Ask clarifying questions when needed

**Example**:

```
All of these should work:
- "Start a roofing inspection"
- "Begin roof check"
- "New inspection for the roof"
- "I need to inspect a roof"
```

---

### 3. Context-Aware

**Principle**: System remembers context and uses it to minimize user effort.

**Guidelines**:

- Remember previous interactions in session
- Infer context from current task
- Don't ask for information already known
- Proactively suggest next steps

**Example**:

```
User: "Start a roofing inspection"
Scing: "Starting roofing inspection. Is this for the Johnson property on Main Street?"
      (remembers property from yesterday)
User: "Yes"
Scing: "Great. Let's begin with the shingles."
```

---

### 4. Transparent & Trustworthy

**Principle**: Users always know what the system is doing and why.

**Guidelines**:

- Announce actions before taking them
- Explain reasoning when making suggestions
- Admit uncertainty explicitly
- Provide confidence scores when relevant

**Example**:

```
Scing: "I detected a crack in the foundation. Confidence: 87%.
       This appears to be a linear crack about 6mm wide.
       IBC Section 1807.1.6 requires evaluation for cracks over 5mm.
       Would you like me to add this to the report?"
```

---

## Conversation Design

### Turn-Taking

**Pattern**: Clear indication of who should speak next.

```
Scing speaks → [pause] → User can respond
User speaks → [Scing processes] → Scing responds
```

**Visual indicators**:

- 🎤 Listening (mic icon pulsing)
- ⏳ Processing (spinner)
- 💬 Speaking (waveform animation)

---

### Prompts

**Good prompts are**:

- **Specific**: "Say 'capture' to take a photo"
- **Actionable**: "Would you like me to add this to the report?"
- **Concise**: 1-2 sentences maximum

**Bad prompts are**:

- Vague: "What would you like to do?"
- Open-ended without guidance: "Tell me about the roof"
- Too long: Multiple paragraphs

---

### Confirmations

**Always confirm**:

- Destructive actions (delete, finalize)
- Actions with significant consequences (publish, send)
- Ambiguous user requests

**Example**:

```
User: "Delete that finding"
Scing: "You want to delete the foundation crack finding? Say 'yes' to confirm."
User: "Yes"
Scing: "Deleted."
```

---

### Interruptions

Users can interrupt Scing at any time:

```
Scing: "Now let's move on to checking the fla—"
User: "Stop. Go back to shingles."
Scing: "Going back to shingles. What would you like to check?"
```

**Guidelines**:

- Always allow interruptions
- Stop speaking immediately
- Don't penalize user for interrupting
- Resume gracefully

---

## Visual Design

### Minimalist Interface

**Principle**: Screen shows only what's necessary, no clutter.

**Layout**:

```
┌─────────────────────────────────────┐
│         ScingOS                     │ ← Minimal header
├─────────────────────────────────────┤
│                                     │
│     [Current Task Context]          │ ← Focus area
│                                     │
│     [Voice Indicator]               │ ← Voice state
│                                     │
├─────────────────────────────────────┤
│  [Recent Activity / History]        │ ← Secondary info
└─────────────────────────────────────┘
```

---

### Typography

- **Primary**: Large, readable (24-32px for main content)
- **Secondary**: Medium (16-18px for labels)
- **Tertiary**: Small (12-14px for metadata)
- **Font**: Sans-serif, high legibility (Inter, Roboto)

---

### Color System

**Primary Palette**:

- **Primary Blue**: `#0ea5e9` - Trust, technology
- **Success Green**: `#10b981` - Confirmations, success
- **Warning Amber**: `#f59e0b` - Cautions, needs attention
- **Error Red**: `#ef4444` - Errors, critical issues
- **Neutral Gray**: `#6b7280` - Secondary text

**Voice State Colors**:

- **Listening**: Pulsing blue
- **Processing**: Animated cyan
- **Speaking**: Waveform green
- **Error**: Red

---

### Animations

**Purpose**: Provide feedback, maintain engagement

**Types**:

- **Pulse**: Listening state
- **Spin**: Processing/loading
- **Waveform**: Speaking
- **Fade**: Transitions

**Timing**:

- Fast: 150ms (micro-interactions)
- Medium: 300ms (transitions)
- Slow: 500ms (major state changes)

---

## Accessibility

### Visual Accessibility

- **WCAG AA compliance** minimum
- **Color contrast**: 4.5:1 for text
- **Focus indicators**: Visible on all interactive elements
- **Font size**: Minimum 16px
- **Scalable**: Support 200% zoom

### Voice Accessibility

- **Accent tolerance**: Support major English dialects
- **Background noise**: Noise cancellation enabled
- **Speech rate**: Adjustable TTS speed
- **Alternative input**: Keyboard/touch fallback always available

### Motor Accessibility

- **Touch targets**: Minimum 44x44px
- **No time pressure**: User controls pace
- **Voice-only mode**: Complete hands-free operation

---

## Error Handling

### Voice Recognition Errors

**Pattern**: Graceful degradation with retry

```
Scing: "Sorry, I didn't catch that. Could you repeat?"
[If fails again]
Scing: "I'm having trouble understanding. You can also type your request or tap the menu."
```

---

### System Errors

**Pattern**: Apologize, explain, offer solution

```
Scing: "I'm sorry, I'm having trouble connecting to the server.
       Your data is saved locally and will sync when connection is restored.
       You can continue working offline."
```

---

### User Errors

**Pattern**: Gentle correction, education

```
User: "Send report to everyone"
Scing: "I need an email address to send the report.
       Who would you like to send it to?"
```

---

## Performance

### Response Times

| Action               | Target | Acceptable | Poor |
| -------------------- | ------ | ---------- | ---- |
| Wake word detection  | <500ms | <1s        | >1s  |
| Speech recognition   | <1s    | <2s        | >2s  |
| Voice response start | <1s    | <2s        | >2s  |
| Action execution     | <2s    | <5s        | >5s  |

### Optimization Strategies

1. **Streaming responses**: Start TTS before full response generated
2. **Predictive loading**: Pre-fetch likely next steps
3. **Caching**: Cache frequent queries and responses
4. **Compression**: Minimize data transfer
5. **Edge processing**: On-device wake word and simple commands

---

## Best Practices Summary

✅ **DO**:

- Make voice the primary interaction method
- Speak conversationally and naturally
- Remember context across conversation
- Be transparent about what system is doing
- Provide visual confirmation of voice commands
- Allow interruptions at any time
- Handle errors gracefully
- Keep visual interface minimal

❌ **DON'T**:

- Require memorized commands
- Assume user is looking at screen
- Ask for known information repeatedly
- Hide system state or reasoning
- Force user through rigid menus
- Ignore user interruptions
- Show confusing error messages
- Clutter interface with unnecessary elements

---

_Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC_
