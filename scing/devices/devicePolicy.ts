import type { BusContext } from '../lariBus/busTypes';
import type { BaneKey } from '../bane/baneTypes';
import type { CaptureRequest, DevicePolicyDecision } from './deviceTypes';

function mapEngineToBaneKey(engineId: CaptureRequest['engineId']): BaneKey {
  switch (engineId) {
    case 'LARI-VISION':
      return 'vision';
    case 'LARI-MAPPER':
      return 'mapper';
    case 'LARI-DOSE':
      return 'dose';
    case 'LARI-PRISM':
      return 'prism';
    case 'LARI-ECHO':
      return 'echo';
    default:
      // fall back to a safe default key; unknown engines should be gated explicitly upstream.
      return 'vision';
  }
}

function defaultExternalHardware(deviceKind: CaptureRequest['deviceKind']): boolean {
  // Conservative defaults: drone/spectrometer/sonar are treated as external hardware.
  return deviceKind === 'drone' || deviceKind === 'spectrometer' || deviceKind === 'sonar';
}

export function decideDevicePolicy(ctx: BusContext, req: CaptureRequest): DevicePolicyDecision {
  const key = mapEngineToBaneKey(req.engineId);
  const requiresExternalHardware = req.requiresExternalHardware ?? defaultExternalHardware(req.deviceKind);

  const decision = ctx.entitlements({
    key,
    requiredStage: req.requiredStage,
    requiresExternalHardware,
    requiresPhysicalControl: req.requiresPhysicalControl,
  });

  return {
    allow: !!decision.allow,
    reason: decision.reason,
    key,
    requiredStage: req.requiredStage,
  };
}
