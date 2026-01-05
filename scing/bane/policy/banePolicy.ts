import { BANE_POLICY_PROFILES } from './profiles';

export type PolicyHints = {
  strictMode: boolean;
  defaultVerdict: 'deny' | 'allow';
  escalationEnabled: boolean;
  quarantineOnDeny: boolean;
  lockoutOnRepeat: boolean;
  incidentOnCritical: boolean;
};

export function policyForProfile(profileId: string): PolicyHints {
  const id = profileId?.trim() || 'bane_fog_v1';
  const profile = BANE_POLICY_PROFILES[id] ?? BANE_POLICY_PROFILES['bane_fog_v1'];
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
