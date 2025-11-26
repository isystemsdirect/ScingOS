# Scing-Centric UX: Visual Mockup Descriptions

## Overview
This document provides detailed visual descriptions for the Scing-centric interface of SCINGULAR OS. These serve as reference for UI/UX designers creating mockups, prototypes, and final implementations.

---

## Core Visual Elements

### Scing Bot Avatar

**Idle State:**
- Circular or spherical form floating in lower-right corner (mobile) or center-bottom (desktop)
- Soft ambient glow with gentle breathing animation (slow pulse, 2-3 second cycle)
- Color: Cool blue/teal with subtle gradient, representing intelligence and calm
- Size: ~60-80px diameter on mobile, ~100-120px on desktop
- Semi-transparent with frosted glass effect (allows content behind to be visible)
- Subtle particle effects around edges suggesting energy/awareness

**Listening State:**
- Avatar expands slightly (10-15% larger)
- Outer ring appears with animated waveform visualization
- Waveform responds to voice input in real-time (amplitude matches speech)
- Color shifts to brighter blue/white indicating active listening
- Pulsing glow synchronized with audio input

**Processing State:**
- Avatar shows rotating geometric patterns or orbital rings
- Smooth, continuous rotation suggesting computation
- Color cycles through blue-purple-cyan gradient
- Optional loading indicator: percentage or progress arc
- Subtle shimmer effect across surface

**Speaking State:**
- Waveform emanates from center, synchronized with Scing's voice output
- Gentle expansion/contraction with speech rhythm
- Warm color shift (blue to soft white/yellow) indicating communication
- Text caption appears above avatar showing what Scing is saying (optional, accessibility)

**Alert/Error State:**
- Sharp color shift to amber (warning) or red (error)
- Rapid pulsing animation
- Optional shake/vibration effect
- Alert icon overlay (exclamation point, shield for security)

---

## Screen Layouts

### Mobile Interface (Portrait)

**Default View:**
- Clean, minimal background (blurred wallpaper or solid gradient)
- Scing avatar positioned lower-right, 20px from edges
- No visible menu bars, toolbars, or navigation chrome
- Status indicators (time, battery, connectivity) minimal and semi-transparent at top

**Active Interaction:**
- User says "Hey Scing, show today's inspections"
- Scing avatar moves to center-bottom
- Floating cards appear above avatar in vertical stack
- Each card: rounded corners, frosted glass effect, subtle shadow
- Card content: inspection thumbnails, title, date, status indicator
- Swipe up/down to browse cards
- Tap card for details, or voice command: "Open the first one"

**AR/HUD Mode (Inspection):**
- Camera viewfinder fills entire screen
- Scing avatar minimized to top-right corner (smaller, semi-transparent)
- Data overlays appear on camera feed:
  - Temperature readings near thermal hotspots
  - Measurement lines with dimensions
  - Annotations and markers placed by Scing
- Voice commands control all functions: "Capture," "Measure distance," "Tag this area"

### Tablet Interface (Landscape)

**Default View:**
- Larger Scing avatar positioned center-bottom
- More screen real estate allows multiple floating cards side-by-side
- Cards organized in grid layout when multiple results shown
- Split-screen capability: Scing on left, results on right

**Multi-Window Mode:**
- User: "Hey Scing, show report draft and reference photos"
- Left panel: document editor (voice-dictated content)
- Right panel: photo gallery
- Scing avatar remains accessible in dock area
- Cross-reference commands: "Insert photo 3 into section 2"

### Desktop Interface

**Default View:**
- Larger Scing avatar (120px+) positioned center-bottom or in dedicated sidebar
- Expansive canvas for floating windows and cards
- Multi-monitor support: Scing appears on primary display, results can span monitors
- Keyboard shortcuts available but not required

**Workspace Mode:**
- Scing in left sidebar with status panel
- Main area shows inspection dashboard, calendar, or social feed
- All navigation via voice: "Show calendar," "Open marketplace," "Check team messages"
- Results populate main canvas as floating, resizable panels

### Industrial/Field Equipment (HUD)

**Head-Mounted Display:**
- Minimal UI, maximum information density
- Scing avatar as small icon in peripheral vision (top-right or bottom-left)
- Critical data overlaid on field of view: measurements, alerts, guidance arrows
- Hands-free operation essential: all commands voice-activated
- High-contrast colors for outdoor visibility

**Rugged Tablet (Field Use):**
- Large touch targets for glove-friendly interaction (fallback)
- Voice-first still primary: "Hey Scing, start foundation inspection"
- Bright, high-contrast display optimized for sunlight
- Simplified card layouts with large text, clear icons

---

## Floating Cards Design

### Card Anatomy
- Frosted glass background with blur effect (backdrop-filter)
- Subtle shadow for depth (4-8px soft shadow)
- Rounded corners (12-16px radius)
- Padding: 16-24px internal spacing
- Header: icon + title (bold, 16-18pt)
- Body: content (text, images, data visualizations)
- Footer: action buttons or metadata (timestamp, tags)

### Card Types

**Information Card:**
- Displays text, data, or status updates
- Example: "Inspection complete. 3 issues found."
- Icon indicator for severity (green checkmark, yellow warning, red alert)

**Media Card:**
- Shows photos, videos, or 3D models
- Thumbnail with expand capability
- Voice commands: "Zoom in," "Play video," "Next image"

**Action Card:**
- Presents options requiring user decision
- Example: "Post this to team feed? Yes / No"
- Voice or tap to confirm

**Navigation Card:**
- Quick access to features or sections
- Grid of icons with labels
- Voice: "Open marketplace" or tap icon

### Card Interactions

**Appearance Animation:**
- Fade in with gentle scale-up (0.95 → 1.0)
- Smooth easing curve (cubic-bezier)
- Stagger animation when multiple cards appear

**Dismissal:**
- Voice: "Close that" or "Dismiss"
- Swipe gesture (mobile/tablet)
- Fade out with scale-down (1.0 → 0.9)

---

## Color Palette

### Primary Colors
- **Scing Blue:** #00A8E8 (primary avatar, active states)
- **Deep Blue:** #003D5B (backgrounds, dark mode)
- **Accent Cyan:** #00D9FF (highlights, links)

### Status Colors
- **Success Green:** #00D084 (confirmations, completed tasks)
- **Warning Amber:** #FFB627 (alerts, attention needed)
- **Error Red:** #FF4757 (errors, critical alerts)
- **Neutral Gray:** #6C757D (disabled, secondary text)

### Background
- **Light Mode:** Soft gradient (white to light blue-gray)
- **Dark Mode:** Deep blue-black gradient (#0A1929 to #001E3C)
- **Frosted Glass:** White at 20% opacity with 10px blur

---

## Typography

### Font Family
- **Primary:** SF Pro / Segoe UI / Roboto (system native, modern sans-serif)
- **Monospace:** SF Mono / Consolas (for code, data)

### Font Sizes
- **Heading 1:** 28-32pt (page titles)
- **Heading 2:** 22-24pt (section headers)
- **Body:** 14-16pt (main content)
- **Caption:** 12-13pt (metadata, timestamps)
- **Scing Speech:** 16-18pt (displayed captions)

### Font Weights
- **Regular:** 400 (body text)
- **Medium:** 500 (UI labels)
- **Semibold:** 600 (headings, emphasis)
- **Bold:** 700 (critical alerts)

---

## Animations & Transitions

### Timing
- **Fast:** 150-200ms (button presses, micro-interactions)
- **Standard:** 250-350ms (card appearance, transitions)
- **Slow:** 450-600ms (page transitions, major state changes)

### Easing
- **Ease-out:** Elements entering (quick start, gentle landing)
- **Ease-in:** Elements exiting (gentle start, quick finish)
- **Ease-in-out:** Two-way transitions (smooth throughout)

### Key Animations
- **Avatar pulse:** Continuous, 2.5s cycle, ease-in-out
- **Waveform:** Real-time, 60fps, synchronized with audio
- **Card entry:** Scale + fade, 300ms, ease-out
- **Card exit:** Scale + fade, 250ms, ease-in

---

## Accessibility Considerations

### Visual
- High contrast mode: 7:1 minimum ratio (WCAG AAA)
- Large text option: 1.5x scale multiplier
- Reduced motion: Disable animations, use simple fades only
- Color-blind safe: Use icons/patterns in addition to color coding

### Audio
- Visual captions for all Scing speech
- Sound effects for state changes (optional, user-configurable)
- Haptic feedback for touch interactions

### Input
- Voice primary, touch fallback always available
- Keyboard navigation support (desktop)
- External switch/accessibility device support

---

These visual specifications provide a foundation for creating mockups and prototypes that embody the Scing-centric, voice-first philosophy of SCINGULAR OS. Designers should iterate based on user testing and platform-specific requirements.