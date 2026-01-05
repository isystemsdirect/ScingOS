import type { ScingSignals } from "./scingSignals";
import type { ColorFlux, FluxLayer, HueTag } from "./colorFlux.types";
import { DEFAULT_HUES, DEFAULT_THEME_WEIGHTS } from "./colorFlux.defaults";
import { clamp01, lerp, normWeights } from "./colorFlux.utils";

function clampRange(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function baseParamsFromSignals(s: ScingSignals) {
  const arousal = Math.max(s.urgency, 1 - s.load);
  const seriousness = s.safety;

  const lightness = clamp01(0.42 + 0.22 * s.confidence + 0.10 * (1 - seriousness) - 0.10 * seriousness);
  const chroma = clamp01(0.35 + 0.45 * s.novelty - 0.40 * seriousness);
  const alpha = clamp01(0.95);

  return {
    arousal: clamp01(arousal),
    seriousness: clamp01(seriousness),
    chroma,
    lightness,
    alpha,
  };
}

function layer(tag: HueTag, weight: number, chroma: number, lightness: number, alpha: number): FluxLayer {
  return {
    tag,
    hueDeg: DEFAULT_HUES[tag],
    weight,
    chroma: clamp01(chroma),
    lightness: clamp01(lightness),
    alpha: clamp01(alpha),
  };
}

function upsertLayer(layers: FluxLayer[], next: FluxLayer): FluxLayer[] {
  const idx = layers.findIndex((l) => l.tag === next.tag);
  if (idx === -1) return [...layers, next];
  const cur = layers[idx];
  const merged: FluxLayer = {
    ...cur,
    weight: cur.weight + next.weight,
    chroma: (cur.chroma * cur.weight + next.chroma * next.weight) / (cur.weight + next.weight),
    lightness: (cur.lightness * cur.weight + next.lightness * next.weight) / (cur.weight + next.weight),
    alpha: Math.max(cur.alpha, next.alpha),
  };
  return [...layers.slice(0, idx), merged, ...layers.slice(idx + 1)];
}

export function mapScingToColorFlux(s: ScingSignals): ColorFlux {
  const notes: string[] = [];

  // LEAD tag selection (primary)
  let leadTag: HueTag = "neutral";
  if (s.affect === "protective" || s.safety > 0.7) {
    leadTag = "protective";
  } else if (s.affect === "alert" || s.urgency > 0.7) {
    leadTag = "alert";
  } else if (s.speechMode === "thinking" && s.coherence > 0.6) {
    leadTag = "focus";
  } else if (s.novelty > 0.6 && s.stability > 0.5) {
    leadTag = "curious";
  } else if (s.stability > 0.7) {
    leadTag = "calm";
  } else {
    leadTag = "neutral";
  }

  const p = baseParamsFromSignals(s);

  // Lead weight: majority, influenced by seriousness/arousal
  const [leadLo, leadHi] = DEFAULT_THEME_WEIGHTS.leadWeightRange;
  const leadWeight = clampRange(0.60 + 0.10 * p.seriousness + 0.05 * p.arousal, leadLo, leadHi);

  const lead = layer(
    leadTag,
    leadWeight,
    // lead chroma/lightness are strong but bounded by safety
    lerp(p.chroma, 0.25, p.seriousness),
    lerp(p.lightness, 0.38, p.seriousness),
    1
  );

  // Supports + accents from orthogonal channels
  const supports: FluxLayer[] = [];
  const accents: FluxLayer[] = [];

  const [supLo, supHi] = DEFAULT_THEME_WEIGHTS.supportWeightRange;
  const [accLo, accHi] = DEFAULT_THEME_WEIGHTS.accentWeightRange;

  // confidence high => focus support (amber) low weight
  if (s.confidence > 0.65) {
    const w = clampRange(lerp(supLo, supHi, clamp01((s.confidence - 0.65) / 0.35)) * 0.6, supLo * 0.5, supHi * 0.7);
    supports.push(layer("focus", w, lerp(0.55, 0.35, p.seriousness), lerp(0.52, 0.45, p.seriousness), 0.95));
    notes.push("confidence→focus");
  }

  // load high => recovering/calm support (blue/teal), lower lightness
  if (s.load > 0.6) {
    const w = clampRange(lerp(supLo, supHi, clamp01((s.load - 0.6) / 0.4)), supLo, supHi);
    supports.push(layer("recovering", w, lerp(0.35, 0.22, p.seriousness), lerp(0.40, 0.32, p.seriousness), 0.95));
    supports.push(layer("calm", w * 0.55, lerp(0.30, 0.18, p.seriousness), lerp(0.44, 0.35, p.seriousness), 0.90));
    notes.push("load→recovering/calm");
  }

  // urgency high => alert support even if not lead
  if (s.urgency > 0.5 && leadTag !== "alert") {
    const w = clampRange(lerp(supLo, supHi, clamp01((s.urgency - 0.5) / 0.5)) * 0.75, supLo * 0.6, supHi);
    supports.push(layer("alert", w, lerp(0.60, 0.35, p.seriousness), lerp(0.48, 0.42, p.seriousness), 0.95));
    notes.push("urgency→alert");
  }

  // safety high => protective support, reduce chroma elsewhere
  if (s.safety > 0.5 && leadTag !== "protective") {
    const w = clampRange(lerp(supLo, supHi, clamp01((s.safety - 0.5) / 0.5)) * 0.8, supLo * 0.6, supHi);
    supports.push(layer("protective", w, 0.40, lerp(0.42, 0.36, p.seriousness), 0.95));
    notes.push("safety→protective");
  }

  // novelty high => curious accent but clamp by safety/stability
  const noveltyAllowed = clamp01(s.novelty * (1 - s.safety) * s.stability);
  if (noveltyAllowed > 0.25) {
    const w = clampRange(lerp(accLo, accHi, noveltyAllowed), accLo, accHi);
    accents.push(layer("curious", w, lerp(0.70, 0.40, p.seriousness), lerp(0.55, 0.48, p.seriousness), 0.95));
    notes.push("novelty→curious(accent)");
  }

  // Merge duplicates and normalize remaining weights
  let mergedSupports: FluxLayer[] = [];
  for (const s0 of supports) mergedSupports = upsertLayer(mergedSupports, s0);

  let mergedAccents: FluxLayer[] = [];
  for (const a0 of accents) mergedAccents = upsertLayer(mergedAccents, a0);

  // Apply safety chroma reduction to non-lead layers
  const chromaScale = lerp(1, 0.65, p.seriousness);
  mergedSupports = mergedSupports.map((l) => ({ ...l, chroma: clamp01(l.chroma * chromaScale) }));
  mergedAccents = mergedAccents.map((l) => ({ ...l, chroma: clamp01(l.chroma * chromaScale) }));

  // Allocate remaining weight across supports/accents (lead holds majority)
  const remaining = clamp01(1 - lead.weight);
  const supportSum = mergedSupports.reduce((acc, l) => acc + l.weight, 0);
  const accentSum = mergedAccents.reduce((acc, l) => acc + l.weight, 0);
  const denom = supportSum + accentSum;

  if (denom > 0) {
    mergedSupports = mergedSupports.map((l) => ({ ...l, weight: (l.weight / denom) * remaining * 0.80 }));
    mergedAccents = mergedAccents.map((l) => ({ ...l, weight: (l.weight / denom) * remaining * 0.20 }));
  } else {
    // No supports/accents: give lead everything
    lead.weight = 1;
  }

  mergedSupports = normWeights(mergedSupports);
  mergedAccents = normWeights(mergedAccents);

  // Re-scale to preserve absolute weights after normWeights
  const supportsAbsSum = mergedSupports.reduce((acc, l) => acc + l.weight, 0);
  const accentsAbsSum = mergedAccents.reduce((acc, l) => acc + l.weight, 0);

  if (supportsAbsSum > 0) {
    const supportsTarget = remaining * 0.80;
    mergedSupports = mergedSupports.map((l) => ({ ...l, weight: l.weight * supportsTarget }));
  }

  if (accentsAbsSum > 0) {
    const accentsTarget = remaining * 0.20;
    mergedAccents = mergedAccents.map((l) => ({ ...l, weight: l.weight * accentsTarget }));
  }

  return {
    ts: s.ts,
    lead,
    supports: mergedSupports,
    accents: mergedAccents,
    notes: notes.length ? notes : undefined,
  };
}
