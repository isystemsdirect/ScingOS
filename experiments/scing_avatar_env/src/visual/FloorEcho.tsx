import Floor from './Floor'

/**
 * Legacy compatibility wrapper.
 * The active floor + reflection implementation is now `Floor`.
 */
export default function FloorEcho(props: { floorY: number; size?: number }) {
  return <Floor floorY={props.floorY} size={props.size} />
}
