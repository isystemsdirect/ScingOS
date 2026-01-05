import { useContext } from 'react';
import { LariBusContext } from './LariBusProvider';

export function useLariBus() {
  return useContext(LariBusContext);
}
