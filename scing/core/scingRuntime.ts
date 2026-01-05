import { SRTRuntime } from '../srt/srtRuntime';
import { orderAndFocus } from './orderFocusProtocol';
import { allowGrowth } from './growthProtocol';
import { allowCatalyst } from './catalystProtocol';
import { AuditLog } from '../guards/auditLog';

export type SensorFlux = number[];

/**
 * ScingRuntime: host runtime that continuously *invokes existence*.
 * IMPORTANT:
 * - Do not own deterministic playback
 * - Do not store/replay frames
 * - Do not implement expression state machines
 */
export class ScingRuntime {
  private srt = new SRTRuntime();
  private audit = new AuditLog();

  /**
   * exist(): invoke continuously from your app scheduling mechanism.
   * Canon: expression is field-driven; no loops/timelines owned here.
   */
  exist(sensorFlux: SensorFlux, opts?: { persistence?: number; strain?: number }) {
    this.srt.exist(sensorFlux);

    const influence = this.srt.influence.sample();
    const ordered = orderAndFocus(influence);

    // Formal engineering gate: only engineer when ordered === true
    this.audit.note('orderFocus', { ordered });

    // Autonomous sub-engine eligibility signals (stubs; wire real metrics later)
    const persistence = opts?.persistence ?? 0;
    const strain = opts?.strain ?? 0;

    const growthOk = allowGrowth(ordered, persistence);
    const catalystOk = allowCatalyst(ordered, strain);

    this.audit.note('growthEligibility', { growthOk, persistence });
    this.audit.note('catalystEligibility', { catalystOk, strain });

    // NOTE: Actual sub-engine birth/merge/retire belongs in governance layer.
  }
}
