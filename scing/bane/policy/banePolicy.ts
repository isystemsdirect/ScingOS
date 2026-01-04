export type PolicyHints = {
  strictMode: boolean;
  defaultVerdict: 'deny' | 'allow';
  escalationEnabled: boolean;
  quarantineOnDeny: boolean;
  lockoutOnRepeat: boolean;
  incidentOnCritical: boolean;
};

export function policyForProfile(profileId: string): PolicyHints {
  if (profileId === 'bane_fog_v1') {
    return {
      strictMode: true,
      defaultVerdict: 'deny',
      escalationEnabled: true,
      quarantineOnDeny: true,
      lockoutOnRepeat: true,
      incidentOnCritical: true,
    };
  }

  return {
    strictMode: false,
    defaultVerdict: 'allow',
    escalationEnabled: false,
    quarantineOnDeny: false,
    lockoutOnRepeat: false,
    incidentOnCritical: false,
  };
}
