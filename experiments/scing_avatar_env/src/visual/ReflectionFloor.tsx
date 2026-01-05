import Floor from './Floor'

type Props = {
  positionY?: number
  size?: number
}

/**
 * Legacy compatibility wrapper.
 * The active floor + reflection implementation is now `Floor`.
 */
export default function ReflectionFloor({ positionY = -1.05, size = 18 }: Props) {
  return <Floor floorY={positionY} size={size} />
}

