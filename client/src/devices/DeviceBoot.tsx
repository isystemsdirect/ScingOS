import React, { useMemo } from 'react';
import { DeviceRouterContext } from './useDeviceRouter';
import { createClientDeviceRouter } from './deviceClient';

export const DeviceBoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useMemo(() => createClientDeviceRouter(), []);
  return <DeviceRouterContext.Provider value={router}>{children}</DeviceRouterContext.Provider>;
};
