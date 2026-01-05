import type { BusContext } from '../lariBus/busTypes';
import { createCapabilityRegistry, type CapabilityRegistry } from './capabilityRegistry';
import type { CaptureRecord, CaptureRequest, CaptureResult } from './deviceTypes';
import type { DeviceProvider } from './providers';
import type { CaptureStore } from './captureStore';
import { decideDevicePolicy } from './devicePolicy';
import {
  DevicePolicyDeniedError,
  DeviceUnavailableError,
  CaptureFailedError,
} from './deviceErrors';

export type DeviceRouter = {
  registerProvider: (
    provider: DeviceProvider,
    capability: {
      deviceKind: CaptureRequest['deviceKind'];
      captureKinds: CaptureRequest['captureKind'][];
      label?: string;
      requiresExternalHardware?: boolean;
      requiresPhysicalControl?: boolean;
    }
  ) => void;
  capture: (ctx: BusContext, req: CaptureRequest) => Promise<CaptureResult>;
  registry: CapabilityRegistry;
};

function makeRecordBase(req: CaptureRequest, status: CaptureRecord['status']): CaptureRecord {
  const now = new Date().toISOString();
  return {
    captureId: req.requestId,
    requestId: req.requestId,
    correlationId: req.correlationId,
    orgId: req.orgId,
    uid: req.uid,
    deviceId: req.deviceId,
    inspectionId: req.inspectionId,
    engineId: req.engineId,
    deviceKind: req.deviceKind,
    captureKind: req.captureKind,
    capturedAt: now,
    status,
  };
}

export function createDeviceRouter(params?: {
  registry?: CapabilityRegistry;
  captureStore?: CaptureStore;
}): DeviceRouter {
  const registry = params?.registry ?? createCapabilityRegistry();
  const providers = new Map<string, DeviceProvider>();
  const captureStore = params?.captureStore;

  const router: DeviceRouter = {
    registry,
    registerProvider: (provider, capability) => {
      providers.set(provider.providerId, provider);
      registry.register({
        providerId: provider.providerId,
        capability: {
          deviceKind: capability.deviceKind,
          captureKinds: capability.captureKinds,
          label: capability.label,
          requiresExternalHardware: capability.requiresExternalHardware,
          requiresPhysicalControl: capability.requiresPhysicalControl,
        },
      });
    },
    capture: async (ctx, req) => {
      const policy = decideDevicePolicy(ctx, req);
      if (!policy.allow) {
        const record: CaptureRecord = {
          ...makeRecordBase(req, 'rejected'),
          error: { code: 'DEVICE_POLICY_DENIED', message: policy.reason },
        };
        throw new DevicePolicyDeniedError(policy.reason, { record, policy });
      }

      const candidates = registry.findProviders({
        deviceKind: req.deviceKind,
        captureKind: req.captureKind,
      });
      const provider = candidates
        .map((c) => providers.get(c.providerId))
        .find((p) => !!p && p.supports(req));

      // No provider available: either queue (if store available) or fail.
      if (!provider) {
        const record: CaptureRecord = {
          ...makeRecordBase(req, captureStore ? 'queued' : 'rejected'),
          error: captureStore
            ? { code: 'CAPTURE_QUEUED', message: 'NO_PROVIDER_AVAILABLE' }
            : { code: 'DEVICE_UNAVAILABLE', message: 'NO_PROVIDER_AVAILABLE' },
        };

        if (captureStore) {
          await captureStore.enqueue({ queuedAt: new Date().toISOString(), request: req, record });
          return { status: 'queued', record };
        }

        throw new DeviceUnavailableError('NO_PROVIDER_AVAILABLE', { record });
      }

      try {
        const res = await provider.capture(req);
        const record: CaptureRecord = {
          ...makeRecordBase(req, 'ok'),
          artifacts: res.artifacts,
        };

        // If we're offline but we have a store, queue the record for later upload.
        if (req.mode === 'offline' && captureStore) {
          await captureStore.enqueue({ queuedAt: new Date().toISOString(), request: req, record });
          return { status: 'queued', record };
        }

        return { status: 'ok', record };
      } catch (e: any) {
        const record: CaptureRecord = {
          ...makeRecordBase(req, 'rejected'),
          error: { code: 'CAPTURE_FAILED', message: e?.message ?? 'CAPTURE_FAILED' },
        };
        throw new CaptureFailedError(e?.message ?? 'CAPTURE_FAILED', { record });
      }
    },
  };

  return router;
}
