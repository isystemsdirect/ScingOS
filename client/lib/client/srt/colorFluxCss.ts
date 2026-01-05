import type { ColorFlux } from "../../shared/srt/colorFlux.types";

export type FluxCss = {
  style: Record<string, string>;
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function hsla(h: number, s: number, l: number, a: number) {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.round(clamp01(s) * 100);
  const ll = Math.round(clamp01(l) * 100);
  const aa = clamp01(a);
  return `hsla(${hh}, ${ss}%, ${ll}%, ${aa})`;
}

export function buildFluxCss(flux?: ColorFlux): FluxCss {
  if (!flux) {
    return {
      style: {
        "--srt-flux":
          "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.10), rgba(0,0,0,0.0) 60%)",
      },
    };
  }

  const lead = flux.lead;
  const supports = flux.supports ?? [];
  const accents = flux.accents ?? [];

  const leadCss = hsla(lead.hueDeg, lead.chroma, lead.lightness, lead.alpha);
  const supportStops = supports
    .slice(0, 6)
    .map((x) => hsla(x.hueDeg, x.chroma, x.lightness, x.alpha));

  const accentStops = accents
    .slice(0, 4)
    .map((x) => hsla(x.hueDeg, x.chroma, x.lightness, x.alpha));

  // Compose a layered flux:
  // - base radial: lead glow
  // - secondary radial: supports
  // - conic shimmer ring: accents
  const secondary = supportStops.length
    ? `radial-gradient(circle at 35% 35%, ${supportStops[0]} 0%, rgba(0,0,0,0) 58%),
       radial-gradient(circle at 65% 35%, ${supportStops[1] ?? supportStops[0]} 0%, rgba(0,0,0,0) 58%),
       radial-gradient(circle at 50% 75%, ${supportStops[2] ?? supportStops[0]} 0%, rgba(0,0,0,0) 62%)`
    : `radial-gradient(circle at 50% 50%, rgba(0,0,0,0), rgba(0,0,0,0))`;

  const accentRing = accentStops.length
    ? `conic-gradient(from 90deg at 50% 50%,
        ${accentStops[0]} 0deg,
        ${accentStops[1] ?? accentStops[0]} 120deg,
        ${accentStops[2] ?? accentStops[0]} 240deg,
        ${accentStops[3] ?? accentStops[0]} 360deg)`
    : `conic-gradient(from 90deg at 50% 50%, rgba(0,0,0,0), rgba(0,0,0,0))`;

  const fluxCss = `
    radial-gradient(circle at 50% 55%, ${leadCss} 0%, rgba(0,0,0,0) 62%),
    ${secondary},
    ${accentRing}
  `
    .replace(/\s+/g, " ")
    .trim();

  return {
    style: {
      "--srt-flux": fluxCss,
      "--srt-lead": leadCss,
    },
  };
}
