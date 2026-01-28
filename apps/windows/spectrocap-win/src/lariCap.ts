/**
 * LARI-CAP Hook Adapter (Phase 1)
 * 
 * Minimal pass-through implementation for SpectroCAP™ Phase 1.
 * Phase 2+: Will invoke SCINGOS engine registry for full orchestration.
 * 
 * SpectroCAP™ Phase 1 — Windows Tauri Client
 */

/**
 * Verify context (Phase 1: always true)
 */
export async function verifyContext(_context: Record<string, unknown>): Promise<boolean> {
  // Phase 1: No AI orchestration; simply return true
  console.log('[LARI-CAP] verifyContext: Phase 1 pass-through');
  return true;
}

/**
 * Finalize paste (Phase 1: return text unchanged)
 */
export async function finalizePaste(text: string): Promise<string> {
  // Phase 2+: Invoke LARI-CAP from SCINGOS engine registry for filtering/sanitization
  // Phase 1: Return text as-is
  console.log('[LARI-CAP] finalizePaste: Phase 1 pass-through');
  return text;
}

/**
 * Evaluate recipient (Phase 1: always allow)
 */
export async function evaluateRecipient(_recipientId: string): Promise<boolean> {
  // Phase 2+: Check BANE authorization + device trust
  // Phase 1: Always return true
  console.log('[LARI-CAP] evaluateRecipient: Phase 1 pass-through');
  return true;
}
