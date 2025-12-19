export type RenderStats = {
  calls: number;
  triangles: number;
  lines: number;
  points: number;
  avatarDrawOk: boolean;
  failsafeOn: boolean;
  failsafeForced: boolean;
  floorStrength: number;
};

let stats: RenderStats = {
  calls: 0,
  triangles: 0,
  lines: 0,
  points: 0,
  avatarDrawOk: false,
  failsafeOn: false,
  failsafeForced: false,
  floorStrength: 0,
};

export function setRenderStats(next: RenderStats) {
  // Merge to avoid runtime crashes if any caller omits new fields.
  // (Experiments-only: prioritize stability over strictness.)
  const merged = { ...stats, ...(next as Partial<RenderStats>) } as RenderStats
  // Defensive numeric sanity.
  if (!Number.isFinite(merged.floorStrength)) merged.floorStrength = 0
  stats = merged
}

export function getRenderStats(): RenderStats {
  return stats;
}
