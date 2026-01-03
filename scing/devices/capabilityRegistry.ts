import type { CaptureKind, DeviceCapability, DeviceKind } from './deviceTypes';

export type DeviceProviderId = string;

export type ProviderDescriptor = {
  providerId: DeviceProviderId;
  capability: DeviceCapability;
};

export type CapabilityRegistry = {
  list: () => ProviderDescriptor[];
  register: (d: ProviderDescriptor) => void;
  findProviders: (params: { deviceKind: DeviceKind; captureKind: CaptureKind }) => ProviderDescriptor[];
};

export function createCapabilityRegistry(): CapabilityRegistry {
  const providers: ProviderDescriptor[] = [];

  return {
    list: () => [...providers],
    register: (d: ProviderDescriptor) => {
      const idx = providers.findIndex((p) => p.providerId === d.providerId);
      if (idx >= 0) providers[idx] = d;
      else providers.push(d);
    },
    findProviders: (params: { deviceKind: DeviceKind; captureKind: CaptureKind }) =>
      providers.filter(
        (p) =>
          p.capability.deviceKind === params.deviceKind &&
          (p.capability.captureKinds.includes(params.captureKind) ||
            p.capability.captureKinds.includes('unknown')),
      ),
  };
}
