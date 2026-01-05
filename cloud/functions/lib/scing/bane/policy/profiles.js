"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BANE_POLICY_PROFILES = void 0;
exports.BANE_POLICY_PROFILES = {
    bane_fog_v1: {
        id: 'bane_fog_v1',
        name: 'BANE Fear-of-God Mode',
        version: '1.0.0',
        rulesetId: 'fog-core',
        defaults: {
            defaultVerdict: 'deny',
            strictMode: true,
            escalationEnabled: true,
            quarantineOnDeny: true,
            lockoutOnRepeat: true,
            incidentOnCritical: true,
        },
    },
};
//# sourceMappingURL=profiles.js.map