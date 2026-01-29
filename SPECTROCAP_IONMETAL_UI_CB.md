# SPECTROCAP™ — SCINGULAR-GRADE UI/UX SYSTEM (IONMETAL)
## Consolidated Batch (CB) — Design First, Implementable, Locked

Design authority for SpectroCAP™. Scope excludes transport logic; references to transport/HTTPS are UI-only.

---

## 0) Core Philosophy (Locked)
- SpectroCAP™ is a precision instrument, not a utility.
- Visual calm + mechanical confidence.
- Minimalism is intentional, not empty.
- Engineered, not themed.

Rules:
- No default Android blue.
- No white canvases.
- No floating mystery icons.
- Discoverability is deliberate.

---

## 1) IonMetal Visual Grammar (Locked)
IonMetal is a MATERIAL language.

Surfaces (Neutral Dominant):
- Primary Surface: deep graphite/slate (matte metal) → `#1A1D20`.
- Secondary Surface: brushed dark steel (slightly lighter) → `#202428`.
- Tertiary Surface: soft charcoal separators → borders `#3A4046`.

Accent (Restrained):
- Electric cyan / ion-blue used ONLY for active, focus, "armed" → `#10C7B8`.
- Accent never floods a canvas.

Text:
- Primary text: near-white with warm tint → `#E9EDF2`.
- Secondary text: desaturated silver/gray → `#C0C6CC`.
- Disabled: low-contrast steel gray → `#9AA3AD`.

Emotional Result: quiet power, zero noise.

---

## 2) Global Layout System
Canvas:
- Max content width: 520dp (phones), centered.
- Background is always a surface (never pure white).
- Outer padding: 24dp.
- Section spacing: 20dp.
- Element spacing: 12dp.

Shapes:
- Global radius: 20dp.
- No mixed radii; buttons/cards/rows share geometry.

Elevation:
- Subtle only: 2–4dp equivalent.
- Shadows restrained; never attention-seeking.

---

## 3) Home Screen — Purposeful Minimalism
Content only:
A) Status Core (Card)
- Title: "SpectroCAP™"
- Subtext: "Secure Clipboard Bridge"
- Live Indicator (dot + text): "Receiver Connected" (accent) or "Receiver Offline" (neutral)

B) Primary Action
- Large button: "Send Clipboard"
- Height 52dp, full-width
- IonMetal surface with accent edge highlight

C) Secondary Action (Quiet)
- "Clear Clipboard"
- Same size, lower contrast

No settings fields, IP inputs, port numbers, or technical jargon on Home.

---

## 4) Settings — Official Entrypoint (Mandatory)
Entrypoints (one or both):
- Top-right gear icon in header.
- Explicit row under Home actions: "Settings" → chevron.

Fail Condition: if Settings isn’t discoverable in 3 seconds, design fails.

---

## 5) Settings Screen Structure
Settings is a hub, not a form.

Section A — Receiver Configuration
- Endpoint (readable, not editable by default)
- HTTPS status badge
- "Edit Configuration" (secondary screen)

Section B — Network & Transport
- Transport: HTTPS (locked indicator)
- Certificate status
- LAN mode description (plain English)

Section C — Documents & Legal
- Terms of Use / Privacy Policy / Open Source Licenses / Versioning

Section D — About
- SpectroCAP™ / Powered by SCINGULAR™
- © 2026 Inspection Systems Direct Inc.
- Creation date: January 28, 2026

Pattern:
- Card-based, uniform row height 56dp
- Icon + title + chevron, perfect vertical alignment

---

## 6) Document & Legal Viewer (Premium)
- Title bar with document name.
- Sub-header branding: SpectroCAP™ / Powered by SCINGULAR™ / © 2026 ISD Inc.
- Content inside a readable card (generous line height).
- Footer branding always visible.

No default WebView look. No edge-to-edge white pages.

---

## 7) Motion Language (Subtle, Engineered)
Motion is feedback, not entertainment.

Rules:
- Press: micro-scale 0.985 + fast fade.
- Navigation: 150–220ms, small horizontal drift + fade.
- No bounce, no overshoot, no playful easing.

Everything feels intentional and restrained.

---

## 8) Brand Footer (Global, Non-Negotiable)
Footer on all screens:
- "Powered by SCINGULAR™"
- "© 2026 Inspection Systems Direct Inc."

Style:
- Small, centered, breathable spacing
- Tonal separation from content

---

## 9) Forbidden UI Patterns (Hard No)
- Default Material blue
- White background canvases
- Settings hidden behind long-press/gestures
- Random icons without labels
- Mixed button sizes
- "Utility app" density
- Technical jargon on Home

---

## 10) Acceptance Test (Visual)
A build passes only if:
- Settings is instantly discoverable.
- App does not resemble default Android.
- IonMetal reads as metallic/graphite, not blue/white.
- UI feels calm, controlled, confident.
- A non-technical user perceives "serious software".

---

## Implementation Compass (Android XML / Compose)
Tokens (use `design/spectrocap.tokens.json`):
- Surfaces: `light/dark` palettes map to IonMetal values above.
- Typography: Inter family, base 16sp; sizes 12–28sp.
- Spacing: 24dp outer, 20dp section, 12dp element; 8pt-derived scale.
- Radius: global 20dp; no mixed radii.
- Shadow: level1-level2 equivalents only.
- Motion: 150–220ms; `FastOutLinearIn`/custom quartic-out.

Compose Guidelines:
- Use `Modifier.background(primarySurface).clip(RoundedCornerShape(20.dp))` for cards/buttons.
- Apply `BorderStroke(1.dp, Color(0xFF3A4046))` for separators.
- Accent only for focus/active/armed indicators: border/edge, not full fills.
- Press states via `animateFloatAsState(0.985f)` + alpha fade.
- Navigation via `AnimatedContent` with horizontal offset + fade.
- Footer: `Text` small size (`12sp`), centered, subdued color.

XML Guidelines:
- Shape drawables: single corner radius 20dp.
- Ripple overlays minimal; accent for focus only.
- Elevation 2–4dp via `android:elevation`; subdued shadow colors.
- Enforce 56dp rows with center vertical alignment.

Home Blueprint:
- `Column` centered width (max 520dp), status card, two full-width 52dp buttons.
- Status dot: small circle (accent when connected, neutral when offline) + label.

Settings Blueprint:
- `LazyColumn` of cards; each card contains rows with icon/title/chevron.
- Badges for HTTPS/certificate statuses are visual-only here.

Document Viewer Blueprint:
- `TopAppBar` → title; sub-header branding below.
- Scrollable card content with generous line height.
- Persistent footer branding at bottom.

---

## Notes
- This CB supersedes stylistic ambiguity; do not reinterpret.
- Transport/HTTPS mentions are visual/status elements only in this CB.
- Next step: Implement IonMetal UI CB in Android XML/Compose.