# SpectroCAP — UI/UX Visual System (IonMetal, SCINGULAR-grade)

Focus pillars: discoverability, symmetry, premium presence.

## Principles
- Minimal chrome, maximal clarity; text-first labels with supportive icons.
- Symmetry across layout, naming, and interaction states.
- Premium presence via refined typography, subtle motion, and material depth.
- Progressive disclosure: simple defaults, deeper control when needed.
- Accessible by default: contrast, readable sizes, predictable affordances.

## Layout System
- 3-pane symmetry: Left Navigation, Center Workspace, Right Inspector.
- Consistent Top Bar: app identity, global actions, quick search.
- Status Dock (bottom): non-blocking feedback, background tasks, mode cues.
- 8pt grid: spacing increments of 4/8/12/16/24/32; density toggle.

## IonMetal Aesthetic
- Material: satin metal—soft gradients, restrained sheen, layered depth.
- Elevation: 3 tiers
  - Base surfaces: flat, low contrast.
  - Interactive surfaces: light elevation, crisp borders.
  - Overlays: blurred backdrop, pronounced separation.
- Motion: micro-interactions only; durations 120–180ms, easing out-quart.

## Color System (tokens)
- Neutrals
  - `ion-steel`: #C0C6CC (text secondary, borders)
  - `tungsten`: #2B2F33 (primary text on light)
  - `graphite`: #1A1D20 (surfaces on dark)
  - `chrome-highlight`: #E6EBF0 (surface highlight)
- Accents
  - `chroma`: #10C7B8 (primary accent)
  - `spectra`: #6D7EFF (secondary accent)
- State
  - Success: #28C773, Warning: #F5A623, Danger: #E14A4A, Info: #3BA0F0
- Contrast targets: AA (normal), AAA for key controls.

## Typography
- Typeface: Inter (system fallback: Segoe UI → Roboto → Arial).
- Scales (px): 12, 14, 16 (base), 18, 20, 24, 28.
- Styles: Title, Section, Label, Body, Mono for technical data.
- Tracking and weight tuned to reduce visual noise; no ultra-thin weights.

## Iconography & Affordances
- Simple geometry, consistent stroke; avoid skeuomorphic detail.
- Icon + label for primary navigation; label-only in dense modes.
- Click targets ≥ 40x40 px; focus rings visible and harmonious.

## Components
- Top Bar: app title, mode switch, global search, profile.
- Navigation Rail: modules, favorites, recents.
- Workspace Canvas: content-first; adaptive layouts.
- Inspector Panel: contextual controls, live previews.
- Command Bar: context actions; icon + short label; overflow groups.
- Cards: module summaries; asymmetric accent stripe for brand.
- Tables: clean grid, sticky headers, inline filters.
- Dialogs/Sheets: compact, well-grouped, keyboard-friendly.

## Discoverability
- Universal search (`Ctrl+K`): commands, settings, entities.
- Inline explainers: `?` tooltips and expandable “Learn more”.
- Empty states: quick actions, sample data, clear next steps.
- First-run cues: guided highlights (no blocking tours), dismissible.

## Symmetry
- IA mirrors layout: global → module → context; left-to-right hierarchy.
- Naming: noun-first labels; consistent order (primary → secondary).
- States: hover → focus → active progression consistent across controls.
- Settings groups map 1:1 to visual tokens (colors, type, spacing, motion).

## Accessibility & Quality
- Keyboard: complete navigability; skip links for long views.
- Screen readers: role & name for all interactive elements.
- Motion safe: “Reduce Motion” setting suppresses non-essential animation.
- High-contrast mode: adjusted neutrals and borders; tested at AA/AAA.

## Premium Presence
- Subtle depth: layered surfaces, restrained shadows.
- Micro-interactions: pressed states, springy toggle; no bouncy theatrics.
- Sound/haptic: off by default; tasteful feedback when enabled.

## Tokenization & Theming
- Light/Dark with consistent contrast, not inverted aesthetics.
- Theming via tokens: color, type, spacing, radius, shadow, motion.
- Exported as JSON (see `design/spectrocap.tokens.json`).

## Validation Checklist
- Contrast: pass for all primary text & controls.
- Density: comfortable and compact modes review.
- Discoverability: key tasks findable within 2 steps.
- Responsiveness: panes stack gracefully; inspector collapses to drawer.

## Notes
- No transport/networking/HTTPS in scope.
- This spec drives component implementations and settings symmetry.