# SpectroCAP — Settings Architecture (Discoverability, Symmetry, Premium)

Scope excludes transport/networking/HTTPS.

## Goals
- Clarity: plain-language labels with concise descriptions.
- Discoverability: fast search, prominent entry points, guided explainers.
- Symmetry: categories mirror visual system tokens and app IA.
- Premium: polished hierarchy, predictable controls, subtle power features.

## Information Architecture
- Global: Appearance, Accessibility, Behavior, Privacy, Storage.
- Profile: Preferences, Shortcuts, Workspace Presets.
- Device: Display scaling, Input, Haptics (if available).
- Modules: Per-module options map 1:1 to features.

## Entry Points & Navigation
- Open Settings: `Ctrl+,` (also via Top Bar → Settings).
- Quick Toggles: density, theme, motion, accent available in Top Bar.
- Search: incremental, scoped filters (global/module), keyboard-first.
- Progressive Disclosure: basic → advanced; inline "Learn more".

## Settings Schema (JSON)
```json
{
  "$id": "spectrocap.settings",
  "version": "1.0",
  "groups": [
    {
      "id": "appearance",
      "label": "Appearance",
      "items": [
        {
          "id": "theme.mode",
          "type": "enum",
          "label": "Theme Mode",
          "description": "Switch between Light and Dark",
          "default": "light",
          "options": ["light", "dark"],
          "tags": ["visual", "core"]
        },
        {
          "id": "theme.accent",
          "type": "color",
          "label": "Accent Color",
          "description": "Primary accent for highlights",
          "default": "#10C7B8",
          "constraints": { "palette": ["#10C7B8", "#6D7EFF", "#28C773"] }
        },
        {
          "id": "density.scale",
          "type": "enum",
          "label": "Density",
          "description": "Control spacing scale",
          "default": "comfortable",
          "options": ["comfortable", "compact"]
        },
        {
          "id": "motion.reduce",
          "type": "boolean",
          "label": "Reduce Motion",
          "description": "Minimize non-essential animations",
          "default": false
        }
      ]
    },
    {
      "id": "accessibility",
      "label": "Accessibility",
      "items": [
        {
          "id": "contrast.level",
          "type": "enum",
          "label": "Contrast Level",
          "description": "Adjust contrast for readability",
          "default": "aa",
          "options": ["aa", "aaa"]
        },
        {
          "id": "text.size",
          "type": "enum",
          "label": "Text Size",
          "description": "Scale typography",
          "default": "base",
          "options": ["small", "base", "large"]
        }
      ]
    },
    {
      "id": "behavior",
      "label": "Behavior",
      "items": [
        {
          "id": "hover.preview",
          "type": "boolean",
          "label": "Hover Previews",
          "description": "Show lightweight previews on hover",
          "default": true
        },
        {
          "id": "sound.feedback",
          "type": "boolean",
          "label": "Sound Feedback",
          "description": "Enable subtle UI sounds",
          "default": false
        }
      ]
    }
  ]
}
```

## UI Model
- Settings Home: featured controls and recent changes.
- Category View: left list (groups), right detail (items).
- Inspector Drawer: contextual settings for current module/view.
- Advanced Drawer: nested controls with clear reset points.
- Search Surface: unified list with badges: group/module/advanced.

## Discoverability Mechanics
- Inline "Explain this" on advanced items.
- Smart defaults; per-module presets with clear provenance.
- Reset: per-item, per-group, global; preview before apply.
- Undo: transient revert for recent changes.

## Symmetry & Consistency
- Groups align with tokens: color, spacing, motion, type.
- Label grammar: noun-first, short phrases, parallel structure.
- Ordering: core → optional → advanced; consistent across groups.

## Persistence & Lifecycle (local-only)
- Storage: local store; batched writes; change events for UI.
- Import/Export: JSON with schema version; validates before apply.
- Policy overlay (optional): mark locked items; show rationale.

## Extensibility
- Module settings register to existing groups or add a new group.
- Conflicts: last-writer-wins; surface conflicts in UI with guidance.
- Validation: hard constraints prevent invalid state; soft warnings guide.

## Quality Gates
- Keyboard + screen reader for all controls.
- Contrast/size checks on every theme & density.
- Discoverability tests: time-to-find core settings within 2 steps.

## Notes
- Keep copy neutral, concise, and user-oriented.
- No transport/networking/HTTPS in this architecture.