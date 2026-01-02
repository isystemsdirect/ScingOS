import VisibleFloor from './floor/VisibleFloor'
import ReflectionPlane from './floor/ReflectionPlane'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'

export default function InfiniteFloor() {
  const opt = useDevOptionsStore()

  // Reflection plane is a first-class system: it stays mounted and stable.
  // Visibility toggle affects only the visible surface pass.
  return (
    <group>
      {opt.floor.floorVisible ? <VisibleFloor /> : null}
      {/* Reflection receiver is independent of the surface */}
      <ReflectionPlane />
    </group>
  )
}
