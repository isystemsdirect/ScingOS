# Human Psyche Protocol (HPP) — Overview (Direct Access)

## Purpose
HPP is a **user-owned operating profile** that translates a person’s habits, preferences, and high-level bio/behavior signals into **structured, explainable** adaptations for Scing.

HPP is designed to help Scing adapt *delivery* (how it communicates and assists) while keeping Scing’s operator core ethics and boundaries unchanged.

## Non‑Medical Scope (Hard Rule)
HPP is **not** a diagnosis engine and must not produce clinical labels or medical claims.

- HPP performs **state estimation** (e.g., energy/load/focus readiness) and preference inference.
- HPP must never label users with clinical terms (e.g., “depressed”, “anxious”, “bipolar”, “ADHD”, etc.) unless a regulated workflow exists (out of scope).

## Consent & User Control (Mandatory)
HPP is **explicit opt‑in** and must support:

- View the profile and all contributing signals
- Export profile and history
- Delete profile and history
- Disable adaptations instantly

Consent must be granular: users should be able to enable/disable each metric category (sleep/HR/steps/etc.).

## Explainability (Mandatory)
Every adaptation must be explainable and cite which signals caused it.

- Each modulation should include explicit reasons like:
  - “sleep debt ↑”
  - “resting HR ↑ vs 21‑day baseline”
  - “HRV ↓ vs baseline”
  - “high interruption rate today”

No hidden “mood inference.”

## Non‑Coercive, User‑Aligned Operation
HPP must be:

- **User-aligned**: preferences are bounded and reversible.
- **Evidence-based**: adaptations require repeated evidence, not single events.
- **Explainable**: every adaptation has reasons.
- **Non-coercive**: never manipulate; only assist.

## Allowed Adaptations (Delivery Only)
HPP may adapt:

- Verbosity (shorter/longer)
- Pacing / checkpoints
- Task chunking and escalation thresholds
- Confirmation frequency

HPP may **not** change Scing’s operator core, safety rules, or investor-mode constraints.

## Data Handling (Local‑First + Minimize)
HPP should be **local-first** by default.

- Store only the minimum metrics required.
- Prefer summary/aggregates (counts, trends, rolling stats) over raw streams.
- Prohibit storing raw wearable sensor streams or raw audio by default.

See also: `docs/privacy/Wearables_Consent_and_Data_Policy.md`.
