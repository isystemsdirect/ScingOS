import { SubEngineBase } from '../subEngineBase';

/**
 * Catalyst Sub-Engine:
 * - short-horizon
 * - pressure resolving
 * - often temporary
 */
export class CatalystTemplateEngine extends SubEngineBase {
  private pressure = 0;

  constructor(id: string) {
    super(id, 'catalyst');
  }

  ingest(signal: number[]) {
    this.pressure += signal.reduce((a, b) => a + Math.abs(b), 0);
  }

  step() {
    // pressure decays after resolution
    this.pressure *= 0.92;
  }

  retireEligible(): boolean {
    return this.pressure < 0.05;
  }
}
