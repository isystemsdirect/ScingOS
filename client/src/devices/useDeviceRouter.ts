import { createContext, useContext } from 'react';
import type { DeviceRouter } from '@scing/devices/deviceRouter';

export const DeviceRouterContext = createContext<DeviceRouter | null>(null);

export function useDeviceRouter(): DeviceRouter | null {
  return useContext(DeviceRouterContext);
}
