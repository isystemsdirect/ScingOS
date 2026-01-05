import type { ReactThreeFiber } from '@react-three/fiber';
import { extend } from '@react-three/fiber';

import { FlameMaterial } from './FlameMaterial';

extend({ FlameMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    flameMaterial: ReactThreeFiber.Object3DNode<InstanceType<typeof FlameMaterial>, typeof FlameMaterial>;
  }
}
