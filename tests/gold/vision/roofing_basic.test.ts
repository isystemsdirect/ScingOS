import input from './roofing_basic.input.json';
import expected from './roofing_basic.expected.output.json';
import { runRegression } from '../../lari/runRegression';
import { handle as visionHandle } from '../../../scing/engines/adapters/LariVision.adapter';

function iso() {
  return '2026-01-03T00:00:00.000Z';
}

test('gold: vision roofing_basic', async () => {
  const i: any = {
    engineId: input.engineId,
    inspectionId: input.inspectionId,
    receivedAt: iso(),
    artifacts: (input as any).artifactIds.map((artifactId: string) => {
      // Deterministic gold mapping: infer types that correspond to requiredArtifacts keys.
      const type = artifactId.includes('overview')
        ? 'roof_overview'
        : artifactId.includes('damage')
          ? 'damage_closeup'
          : 'photo';

      return { artifactId, type };
    }),
    measurements: [],
    fieldInputs: [],
    schemaVersion: '1.0.0',
  };

  const res = await visionHandle({ input: i, fields: { domainKey: (input as any).domainKey } });
  if (res.blocked === true) throw new Error(res.reason);
  runRegression(res.output, expected);
});
