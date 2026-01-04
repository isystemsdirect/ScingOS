export type BanePolicyProfile = {
  id: string;
  name: string;
  version: string;
  rulesetId: string;
  defaults: {
    defaultVerdict: 'deny';
    strictMode: boolean;
    escalationEnabled: boolean;
    quarantineOnDeny: boolean;
    lockoutOnRepeat: boolean;
    incidentOnCritical: boolean;
  };
};

export const BANE_POLICY_PROFILES: Record<string, BanePolicyProfile> = {
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
