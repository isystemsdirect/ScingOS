import { SYSTEM_CLAIMS } from './systemClaims';
import { LARI_CAPABILITY_MATRIX } from '../lari/readiness/capabilityMatrix';

export function regulatoryDisclosure() {
  return {
    generatedAt: new Date().toISOString(),
    systemClaims: SYSTEM_CLAIMS,
    capabilityMatrix: LARI_CAPABILITY_MATRIX,
    auditability: {
      evidenceWorm: true,
      outputSchemas: true,
      regressionHarness: true,
    },
  };
}
