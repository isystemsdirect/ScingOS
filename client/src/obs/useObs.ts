import { useContext } from 'react';
import { ObsContext } from './ObsProvider';

export function useObs() {
  return useContext(ObsContext);
}
