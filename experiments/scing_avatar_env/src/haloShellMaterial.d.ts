import type { ReactThreeFiber } from '@react-three/fiber'
import type { HaloShellMaterial } from './visual/HaloShellMaterial'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      haloShellMaterial: ReactThreeFiber.Object3DNode<InstanceType<typeof HaloShellMaterial>, typeof HaloShellMaterial>
    }
  }
}

export {}
