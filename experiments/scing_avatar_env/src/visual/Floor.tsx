import InfiniteFloor from './InfiniteFloor'

export default function Floor(props: { floorY: number; size?: number }) {
  // NOTE: `floorY` is retained for backward compatibility with older callers.
  // Stage 5 makes floor placement user-controlled via dev options.
  return <InfiniteFloor />
}
