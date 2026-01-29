# IonMetal™ Colorway — Official Specification (LOCKED)

**Date:** January 29, 2026  
**Status:** OFFICIAL LOCKED DEFINITION  
**Compliance Level:** Brand Mandatory  

---

## 🎨 SEMANTIC DEFINITION

**IonMetal™** is a premium, modern, metallic design language emphasizing:

### Visual Hierarchy
- **Surfaces:** Graphite/Slate/Metallic neutrals (primary experience layer)
- **Accent:** Restrained electric cyan highlight (secondary interaction layer)
- **Typography:** High-contrast, professional (NOT "white app")
- **Result:** Premium metallic UI with sophisticated restraint

### Design Principles
1. **NOT Default Material Blue Theme** — IonMetal is a custom colorway
2. **NOT "Blue & White"** — That terminology is reserved for accessibility discussion
3. **NOT a Copy of System Theme** — Purpose-built for SpectroCAP™ brand
4. **Metallic First** — Neutrals drive the experience, cyan accents highlight actions

---

## 🔐 TOKENIZED COLOR DEFINITION

All IonMetal colors **MUST** be implemented ONLY via tokenized system:

### Primary (Action/Focus)
```xml
<color name="primary">#0066FF</color>              <!-- Electric Blue -->
<color name="on_primary">#FFFFFF</color>          <!-- White text on primary -->
<color name="primary_container">#002E7E</color>   <!-- Dark blue (hover/pressed) -->
<color name="on_primary_container">#E8F0FF</color><!-- Light text on dark blue -->
```

**Usage:**
- CTA buttons
- Focus states
- Active tab indicators
- Selected list items

---

### Secondary (Supporting/Context)
```xml
<color name="secondary">#5A6B7D</color>             <!-- Slate Gray -->
<color name="on_secondary">#FFFFFF</color>         <!-- White text on secondary -->
<color name="secondary_container">#3F4F63</color>  <!-- Dark slate (hover/pressed) -->
<color name="on_secondary_container">#E8EEF7</color><!-- Light text on dark slate -->
```

**Usage:**
- Secondary actions
- Toggle switches (off state)
- Secondary navigation
- Contextual information

---

### Accent (Highlight/Glow)
```xml
<color name="accent_glow">#00D9FF</color>         <!-- Cyan Electric (premium highlight) -->
<color name="on_accent_glow">#001A1F</color>      <!-- Dark text on cyan -->
```

**Usage:**
- Premium highlights
- Loading indicators
- Active notifications
- Brand accent moments (subtle)

---

### Surfaces (Neutral Foundation)
```xml
<color name="surface">#F5F7FA</color>             <!-- Light neutral surface -->
<color name="on_surface">#1A1C1F</color>          <!-- Dark text on light surface -->
<color name="surface_variant">#E7EDF5</color>     <!-- Variant neutral (cards/sections) -->
<color name="on_surface_variant">#49525D</color>  <!-- Gray text on variant -->
<color name="background">#FEFFFE</color>          <!-- Off-white background -->
<color name="on_background">#1A1C1F</color>       <!-- Dark text on background -->
```

**Usage:**
- App background
- Card surfaces
- Input fields
- Container backgrounds

---

### Outlines & Dividers
```xml
<color name="outline">#79747E</color>             <!-- Medium gray outline -->
<color name="outline_variant">#CAC7D0</color>     <!-- Light gray outline -->
```

**Usage:**
- Borders on inputs
- Divider lines
- Low-emphasis outlines

---

### Status Colors
```xml
<color name="success">#2E7D32</color>             <!-- Green (success/connection OK) -->
<color name="warning">#F57C00</color>             <!-- Orange (warning/caution) -->
<color name="error">#B3261E</color>               <!-- Red (error/failure) -->
<color name="info">#0066FF</color>                <!-- Blue (info/network activity) -->
```

**Usage:**
- Connection status
- Form validation
- Error messages
- System notifications

---

## 📐 IMPLEMENTATION ARCHITECTURE

### Layers (No Hardcoding Allowed)

```
User-Facing App
    ↓
Layouts (activity_*.xml, view_*.xml)
    ↓
Use theme attrs: @color/primary, ?attr/colorPrimary
    ↓
themes.xml Mapping
    ↓
Reference tokenized colors: @color/primary → #0066FF
    ↓
colors.xml (Single Source of Truth)
    ↓
IonMetal Token Values (LOCKED)
```

### File Structure (Mandatory)

| File | Purpose | Status |
|------|---------|--------|
| `colors.xml` | IonMetal token definitions | ✅ Locked |
| `themes.xml` | Token → theme attr mapping | ✅ Locked |
| `*.xml` layouts | Use theme attrs (NOT hardcoded) | ✅ Verified |

---

## ✅ COMPLIANCE CHECKLIST

### 1. No Hardcoded Colors in Layouts
```xml
❌ WRONG: android:background="#0066FF"
✅ RIGHT: android:background="@color/primary"
✅ BETTER: Use theme attr: ?attr/colorPrimary
```

### 2. No System Color References
```xml
❌ WRONG: android:textColor="@android:color/white"
✅ RIGHT: android:textColor="@color/on_primary"
```

### 3. No "Blue App" Terminology
```
❌ WRONG: "This is a blue and white Material app"
✅ RIGHT: "This implements IonMetal™ colorway"
```

### 4. No Theme Fallback to System Defaults
```
❌ WRONG: App shows Material3/Material2 default theme
✅ RIGHT: App shows IonMetal premium metallic styling
```

---

## 🔍 VERIFICATION PROCESS

### Visual Inspection (On Device)

**IonMetal Active (Correct):**
- Buttons: Electric blue with white text
- Background: Off-white/light gray (metallic look)
- Text: High-contrast dark on light
- Accents: Subtle cyan highlights on interaction
- Overall feel: Premium, professional, modern

**Default Material Theme (Wrong - Bug):**
- Buttons: System blue (varies by OS)
- Background: Pure white or Material default
- Text: Generic contrast
- Accents: System teal/light blue
- Overall feel: Generic, not branded

### Code Inspection

```bash
# Run these to verify compliance:

# 1. Check manifest uses correct theme
Select-String -Path "app/src/main/AndroidManifest.xml" -Pattern 'android:theme="@style/Theme.SpectroCAP'

# 2. Check no hardcoded colors in layouts
git grep -E 'android:(background|textColor)="#' -- "app/src/main/res/layout"
# Expected: NO MATCHES

# 3. Verify colors.xml has all tokens
Select-String -Path "app/src/main/res/values/colors.xml" -Pattern '<color name="(primary|secondary|accent_glow|surface)">'
# Expected: ALL FOUND

# 4. Verify themes.xml maps tokens
Select-String -Path "app/src/main/res/values/themes.xml" -Pattern '<item name="color(Primary|Secondary|Accent|Surface)">'
# Expected: ALL FOUND
```

---

## 🚨 ENFORCEMENT RULES

**RULE 1: IonMetal is Not a Fallback**
- If UI looks like default Material theme = BUG
- Do NOT label it as IonMetal if it's not using token colors

**RULE 2: All Colors Are Tokenized**
- Every color in app must come from colors.xml token
- No hardcoding hex values directly in XML
- No Android system colors (@android:color/*)

**RULE 3: Theme Attributes Are Preferred**
- Use `?attr/colorPrimary` in layouts when possible
- Fall back to `@color/primary` for consistency
- Never hardcode `#0066FF` directly

**RULE 4: Documentation First**
- Any color change requires updating this spec
- Brand colors are locked; system colors can adjust
- Breaking changes need approval

---

## 📊 COLOR PALETTE SUMMARY

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `primary` | #0066FF | Electric Blue | CTAs, Focus |
| `secondary` | #5A6B7D | Slate Gray | Supporting actions |
| `accent_glow` | #00D9FF | Cyan Electric | Premium highlights |
| `surface` | #F5F7FA | Light Neutral | Cards, sections |
| `background` | #FEFFFE | Off-white | App background |
| `on_surface` | #1A1C1F | Dark Gray | Primary text |
| `outline` | #79747E | Medium Gray | Borders |
| `success` | #2E7D32 | Green | Status OK |
| `warning` | #F57C00 | Orange | Caution |
| `error` | #B3261E | Red | Errors |

---

## 🔐 CHANGE CONTROL

**To modify IonMetal colors:**
1. Update colors.xml token value
2. Verify themes.xml references it
3. Confirm no hardcoded overrides exist
4. Rebuild and test on device
5. Verify premium metallic appearance
6. Update this spec with new values

**Locked tokens (Brand Mandatory):**
- ✅ Primary: #0066FF (Electric Blue) — DO NOT CHANGE
- ✅ Secondary: #5A6B7D (Slate Gray) — DO NOT CHANGE
- ✅ Accent: #00D9FF (Cyan Electric) — DO NOT CHANGE

---

**Specification Created:** January 29, 2026  
**Status:** LOCKED FOR PRODUCTION  
**Version:** IonMetal™ v1.0  

**Powered by SCINGULAR™**  
© 2026 Inspection Systems Direct Inc.
