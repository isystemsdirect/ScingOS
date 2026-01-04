let GLOBAL_LOCKDOWN = false;
let LOCKDOWN_REASON = 'unspecified';

export function enableGlobalLockdown(reason: string) {
  GLOBAL_LOCKDOWN = true;
  LOCKDOWN_REASON = reason || 'unspecified';
}

export function disableGlobalLockdown() {
  GLOBAL_LOCKDOWN = false;
  LOCKDOWN_REASON = 'unspecified';
}

export function isGlobalLockdown(): { active: boolean; reason?: string } {
  return GLOBAL_LOCKDOWN ? { active: true, reason: LOCKDOWN_REASON } : { active: false };
}
