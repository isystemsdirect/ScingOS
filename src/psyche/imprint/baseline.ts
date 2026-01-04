export type RollingStats = {
  n: number;
  mean: number;
  variance: number;
  std: number;
};

export function rollingMean(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function rollingStd(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const n = nums.length;
  if (n < 2) return null;
  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const v = nums.reduce((acc, x) => acc + (x - mean) * (x - mean), 0) / (n - 1);
  return Math.sqrt(v);
}

export function computeRollingStats(values: Array<number | null | undefined>): RollingStats | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const n = nums.length;
  if (n < 2) return null;

  // Welford
  let mean = 0;
  let m2 = 0;
  let k = 0;
  for (const x of nums) {
    k++;
    const delta = x - mean;
    mean += delta / k;
    const delta2 = x - mean;
    m2 += delta * delta2;
  }

  const variance = m2 / (n - 1);
  const std = Math.sqrt(variance);
  return { n, mean, variance, std };
}

export function zScore(value: number, stats: RollingStats): number {
  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(stats.std) || stats.std <= 0) return 0;
  return (value - stats.mean) / stats.std;
}

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
