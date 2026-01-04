# CB-A4 — QA + Stability Lock

## Scope

This checklist validates:

- Avatar intent emission is stable and idempotent.
- Voice + neural wiring is truthful (no fabricated “speaking”).
- SRT feedback truth comes only from real runtime signals.
- Reset recovers the UI to a safe baseline.

## Manual acceptance

### A. Avatar → Panel

- Click avatar (bottom-right) toggles the panel.
- Right-click avatar opens the radial menu; click-outside/Escape closes it.
- "Quick Command" items produce a response in the panel.

### B. Voice (PTT)

- Press + hold on avatar triggers `voice_ptt_start`; release triggers `voice_ptt_stop`.
- If TTS is currently speaking, starting PTT cancels speaking (best-effort).

### C. Truthful SRT feedback

- With `NEXT_PUBLIC_SRT_DEBUG=true`, the SRT debug HUD appears and truth transitions match reality:
  - listening only while voice is listening
  - in_flight only while neural request is in flight
  - speaking only while runtime reports speaking

### D. Reset

- Trigger reset (panel Reset button) closes panel, clears last conversation/error, and returns SRT truth/modifiers to defaults.

## Automated checks

- `npm --prefix client test` (if configured)
- Root Jest: `npm test` (or `npx jest`) must include new unit tests under `src/**`.

## Notes

- This checklist does not assert audio quality; it asserts correctness + truthfulness + stability.
