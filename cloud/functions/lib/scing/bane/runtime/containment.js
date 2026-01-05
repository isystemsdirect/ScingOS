"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableGlobalLockdown = enableGlobalLockdown;
exports.disableGlobalLockdown = disableGlobalLockdown;
exports.isGlobalLockdown = isGlobalLockdown;
let GLOBAL_LOCKDOWN = false;
let LOCKDOWN_REASON = 'unspecified';
function enableGlobalLockdown(reason) {
    GLOBAL_LOCKDOWN = true;
    LOCKDOWN_REASON = reason || 'unspecified';
}
function disableGlobalLockdown() {
    GLOBAL_LOCKDOWN = false;
    LOCKDOWN_REASON = 'unspecified';
}
function isGlobalLockdown() {
    return GLOBAL_LOCKDOWN ? { active: true, reason: LOCKDOWN_REASON } : { active: false };
}
//# sourceMappingURL=containment.js.map