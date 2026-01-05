"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyForProfile = policyForProfile;
const profiles_1 = require("./profiles");
function policyForProfile(profileId) {
    const id = profileId?.trim() || 'bane_fog_v1';
    const profile = profiles_1.BANE_POLICY_PROFILES[id] ?? profiles_1.BANE_POLICY_PROFILES['bane_fog_v1'];
    const d = profile.defaults;
    return {
        strictMode: d.strictMode,
        defaultVerdict: d.defaultVerdict === 'deny' ? 'deny' : 'allow',
        escalationEnabled: d.escalationEnabled,
        quarantineOnDeny: d.quarantineOnDeny,
        lockoutOnRepeat: d.lockoutOnRepeat,
        incidentOnCritical: d.incidentOnCritical,
    };
}
//# sourceMappingURL=banePolicy.js.map