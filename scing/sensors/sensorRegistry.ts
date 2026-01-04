import { ThermalStubProvider } from './providers/thermal.stub';
import { LidarStubProvider } from './providers/lidar.stub';
import { GprStubProvider } from './providers/gpr.stub';
import { DroneStubProvider } from './providers/drone.stub';

export const SENSOR_REGISTRY = {
  thermal: new ThermalStubProvider(),
  lidar: new LidarStubProvider(),
  gpr: new GprStubProvider(),
  drone: new DroneStubProvider(),
};

export function getSensorProvider(type: keyof typeof SENSOR_REGISTRY) {
  return SENSOR_REGISTRY[type] ?? null;
}

export function getSensorProviderById(providerId: string) {
  for (const p of Object.values(SENSOR_REGISTRY)) {
    if (p.info().providerId === providerId) return p;
  }
  return null;
}
