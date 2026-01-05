import { useContext } from 'react';
import { ScingContext } from './ScingProvider';

export function useScing() {
  return useContext(ScingContext);
}
