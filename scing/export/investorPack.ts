import { LARI_CAPABILITY_MATRIX } from '../lari/readiness/capabilityMatrix';
import { SYSTEM_CLAIMS } from '../compliance/systemClaims';

export function investorPack() {
  return {
    snapshotAt: new Date().toISOString(),
    moat: [
      'Evidence-linked AI outputs',
      'WORM audit trail',
      'Domain-pack driven intelligence',
      'Deterministic risk normalization',
    ],
    capabilityMatrix: LARI_CAPABILITY_MATRIX,
    claims: SYSTEM_CLAIMS,
    scaleNotes: [
      'Domains add linearly',
      'Sensors activate incrementally',
      'AI cost bounded by governance',
    ],
  };
}
