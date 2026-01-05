"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { SrtControls } from "../../lib/shared/srt/srtControls";
import { buildFluxCss } from "../../lib/client/srt/colorFluxCss";
import { subscribeScingSignals } from "../../lib/client/srt/scingSignalBus";
import { mapScingToSrt } from "../../lib/shared/srt/mapScingToSrt";

type Props = {
  size?: number; // px
  // If you want manual control, pass controls; otherwise it will subscribe to ScingSignals bus.
  controls?: SrtControls;
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

// Map normalized rates to CSS seconds (bounded)
function rateToSeconds(r: number, minS: number, maxS: number) {
  const t = clamp01(r);
  return maxS * (1 - t) + minS * t;
}

export default function SRTFluxOrb(props: Props) {
  const size = props.size ?? 220;

  const [liveControls, setLiveControls] = useState<SrtControls | null>(
    props.controls ?? null,
  );

  useEffect(() => {
    if (props.controls) {
      setLiveControls(props.controls);
      return;
    }
    const unsub = subscribeScingSignals((sig) => {
      const c = mapScingToSrt(sig);
      setLiveControls(c);
    });
    return () => {
      unsub();
    };
  }, [props.controls]);

  const c = liveControls;

  const flux = useMemo(() => buildFluxCss(c?.colorFlux), [c?.colorFlux]);

  const glow = clamp01(c?.glow ?? 0.35);
  const shimmer = clamp01(c?.shimmer ?? 0.25);
  const motionEnergy = clamp01(c?.motionEnergy ?? 0.35);
  const fluidity = clamp01(c?.fluidity ?? 0.55);
  const sharpness = clamp01(c?.sharpness ?? 0.2);

  const pulseS = rateToSeconds(c?.pulseRate ?? 0.25, 0.9, 2.8);
  const breatheS = rateToSeconds(c?.breatheRate ?? 0.35, 2.2, 6);

  // Jitter is the inverse of fluidity, bounded by sharpness; keep subtle (Phase 2)
  const jitter = clamp01((1 - fluidity) * 0.35 + sharpness * 0.15);

  const modeTag = c?.modeTag ?? "idle";

  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: 9999,
    position: "relative",
    overflow: "hidden",
    backgroundImage: `var(--srt-flux)`,
    filter: `saturate(${1 + shimmer * 0.6})`,
    boxShadow: `0 0 ${22 + glow * 38}px rgba(255,255,255,${0.1 + glow * 0.22})`,
    transform: `translateZ(0)`,
    ...flux.style,
    // CSS vars for animations
    ["--pulseS" as any]: `${pulseS}s`,
    ["--breatheS" as any]: `${breatheS}s`,
    ["--glow" as any]: `${glow}`,
    ["--shimmer" as any]: `${shimmer}`,
    ["--motion" as any]: `${motionEnergy}`,
    ["--jitter" as any]: `${jitter}`,
    ["--mode" as any]: modeTag,
  };

  return (
    <div style={style} aria-label="SRT Flux Orb">
      {/* inner core */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          background:
            "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.10), rgba(0,0,0,0) 60%)",
          mixBlendMode: "screen",
          opacity: 0.35 + glow * 0.35,
          animation: `srtBreathe var(--breatheS) ease-in-out infinite`,
        }}
      />

      {/* shimmer ring */}
      <div
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: 9999,
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.0), rgba(255,255,255,0.10), rgba(255,255,255,0.0))",
          opacity: 0.1 + shimmer * 0.35,
          mixBlendMode: "screen",
          animation: `srtSpin calc(var(--pulseS) * 1.25) linear infinite`,
        }}
      />

      {/* motion distortion layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          background: "rgba(255,255,255,0.02)",
          opacity: 0.06 + motionEnergy * 0.12,
          mixBlendMode: "overlay",
          animation: `srtPulse var(--pulseS) ease-in-out infinite`,
        }}
      />

      {/* edge definition */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          border: `1px solid rgba(255,255,255,${0.14 + sharpness * 0.22})`,
          boxShadow: `inset 0 0 ${14 + sharpness * 22}px rgba(255,255,255,${0.05 + glow * 0.1})`,
          pointerEvents: "none",
        }}
      />

      <style jsx>{`
        @keyframes srtSpin {
          from {
            transform: rotate(0deg) scale(1);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }
        @keyframes srtPulse {
          0% {
            transform: scale(1) translate(0px, 0px);
          }
          50% {
            transform: scale(calc(1 + var(--motion) * 0.045))
              translate(calc(var(--jitter) * 1px), calc(var(--jitter) * -1px));
          }
          100% {
            transform: scale(1) translate(0px, 0px);
          }
        }
        @keyframes srtBreathe {
          0% {
            transform: scale(1);
            opacity: ${0.3 + glow * 0.2};
          }
          50% {
            transform: scale(calc(1 + var(--glow) * 0.06));
            opacity: ${0.35 + glow * 0.35};
          }
          100% {
            transform: scale(1);
            opacity: ${0.3 + glow * 0.2};
          }
        }
      `}</style>
    </div>
  );
}
