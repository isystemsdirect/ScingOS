export type RenderStats = {
  calls: number;
  triangles: number;
  lines: number;
  points: number;
  avatarDrawOk: boolean;
  failsafeOn: boolean;
  failsafeForced: boolean;
};

let stats: RenderStats = {
  calls: 0,
  triangles: 0,
  lines: 0,
  points: 0,
  avatarDrawOk: false,
  failsafeOn: false,
  failsafeForced: false,
};

export function setRenderStats(next: RenderStats) {
  stats = next;
}

export function getRenderStats(): RenderStats {
  return stats;
}
