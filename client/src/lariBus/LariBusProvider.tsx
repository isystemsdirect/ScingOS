import React, { createContext, useMemo, useState } from 'react';
import type { LariBusRuntime } from '@scing/lariBus/busRuntime';

export const LariBusContext = createContext<{ bus: LariBusRuntime | null; setBus: (b: LariBusRuntime) => void }>(
  {
    bus: null,
    setBus: () => {},
  }
);

export const LariBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bus, setBus] = useState<LariBusRuntime | null>(null);
  const value = useMemo(() => ({ bus, setBus: (b: any) => setBus(b) }), [bus]);
  return <LariBusContext.Provider value={value}>{children}</LariBusContext.Provider>;
};
