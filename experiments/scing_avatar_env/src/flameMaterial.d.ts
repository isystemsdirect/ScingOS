import type { ReactThreeFiber } from '@react-three/fiber'
import type { FlameMaterial } from './visual/FlameMaterial'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      flameMaterial: ReactThreeFiber.Object3DNode<InstanceType<typeof FlameMaterial>, typeof FlameMaterial>
    }
  }
}

export {}
