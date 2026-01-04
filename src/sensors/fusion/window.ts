import type { FeatureVector, SensorEvent, SituationSnapshot } from '../types';
import { computeFusionConfidence } from './confidence';

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export type FusionWindowConfig = {
  windowMs: number;
  stepMs: number;
};

export const DEFAULT_FUSION_WINDOW: FusionWindowConfig = {
  windowMs: 2000,
  stepMs: 250,
};

export type AggregatedFeatures = {
  mic?: {
    speakingRatio: number;
    avgRms: number;
    speechStartCount: number;
    speechEndCount: number;
    clippedRatio: number;
  };
  camera?: {
    motionEnergyAvg: number;
    lightingLevelAvg: number;
    facePresentRatio: number;
    gazeTowardRatio?: number;
  };
  wearable?: {
    heartRateBpm?: number;
    hrvMs?: number;
    steps?: number;
    activityMinutes?: number;
  };
};

export function aggregateWindow(params: {
  tsStart: number;
  tsEnd: number;
  events: SensorEvent[];
}): AggregatedFeatures {
  const inWindow = params.events.filter((e) => e.ts >= params.tsStart && e.ts <= params.tsEnd);

  const micVad = inWindow.filter((e) => e.kind === 'mic' && 'vad' in e) as Array<any>;
  const camera = inWindow.filter((e) => e.kind === 'camera') as Array<any>;
  const wearable = inWindow.filter((e) => e.kind === 'wearable') as Array<any>;

  const out: AggregatedFeatures = {};

  if (micVad.length > 0) {
    const speakingCount = micVad.filter((e) => e.vad === 'speaking').length;
    const speechStartCount = micVad.filter((e) => e.vad === 'speech_start').length;
    const speechEndCount = micVad.filter((e) => e.vad === 'speech_end').length;
    const clippedCount = micVad.filter((e) => Boolean(e.clipped)).length;

    const avgRms = micVad.reduce((acc, e) => acc + (typeof e.rms === 'number' ? e.rms : 0), 0) / micVad.length;

    out.mic = {
      speakingRatio: speakingCount / micVad.length,
      avgRms,
      speechStartCount,
      speechEndCount,
      clippedRatio: clippedCount / micVad.length,
    };
  }

  if (camera.length > 0) {
    const motionEnergyAvg = camera.reduce((acc, e) => acc + (typeof e.motionEnergy === 'number' ? e.motionEnergy : 0), 0) / camera.length;
    const lightingLevelAvg = camera.reduce((acc, e) => acc + (typeof e.lightingLevel === 'number' ? e.lightingLevel : 0), 0) / camera.length;
    const facePresentRatio = camera.filter((e) => Boolean(e.facePresent)).length / camera.length;
    const gazeKnown = camera.filter((e) => e.gazeApprox && e.gazeApprox !== 'unknown');
    const gazeTowardRatio = gazeKnown.length > 0 ? gazeKnown.filter((e) => e.gazeApprox === 'toward').length / gazeKnown.length : undefined;

    out.camera = {
      motionEnergyAvg,
      lightingLevelAvg,
      facePresentRatio,
      gazeTowardRatio,
    };
  }

  if (wearable.length > 0) {
    const last = (metric: string): number | undefined => {
      const candidates = wearable
        .filter((e) => e.metric === metric)
        .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
      const v = candidates.length > 0 ? candidates[candidates.length - 1].value : undefined;
      return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
    };

    out.wearable = {
      heartRateBpm: last('heart_rate'),
      hrvMs: last('hrv'),
      steps: last('steps'),
      activityMinutes: last('activity'),
    };
  }

  return out;
}

export function buildFeatureVector(params: {
  ts: number;
  correlationId: string;
  userId: string;
  aggregated: AggregatedFeatures;
  windowEvents: SensorEvent[];
}): FeatureVector {
  const { confidence, sources, reasons } = computeFusionConfidence({ windowEvents: params.windowEvents, tsEnd: params.ts });

  const features: FeatureVector['features'] = {
    ...(
      params.aggregated.mic
        ? {
            mic_speaking_ratio: params.aggregated.mic.speakingRatio,
            mic_avg_rms: params.aggregated.mic.avgRms,
            mic_speech_start_count: params.aggregated.mic.speechStartCount,
            mic_speech_end_count: params.aggregated.mic.speechEndCount,
            mic_clipped_ratio: params.aggregated.mic.clippedRatio,
          }
        : {}
    ),
    ...(
      params.aggregated.camera
        ? {
            cam_motion_energy_avg: params.aggregated.camera.motionEnergyAvg,
            cam_lighting_level_avg: params.aggregated.camera.lightingLevelAvg,
            cam_face_present_ratio: params.aggregated.camera.facePresentRatio,
            ...(typeof params.aggregated.camera.gazeTowardRatio === 'number'
              ? { cam_gaze_toward_ratio: params.aggregated.camera.gazeTowardRatio }
              : {}),
          }
        : {}
    ),
    ...(
      params.aggregated.wearable
        ? {
            ...(typeof params.aggregated.wearable.heartRateBpm === 'number'
              ? { wearable_hr_bpm: params.aggregated.wearable.heartRateBpm }
              : {}),
            ...(typeof params.aggregated.wearable.hrvMs === 'number' ? { wearable_hrv_ms: params.aggregated.wearable.hrvMs } : {}),
            ...(typeof params.aggregated.wearable.steps === 'number' ? { wearable_steps: params.aggregated.wearable.steps } : {}),
            ...(typeof params.aggregated.wearable.activityMinutes === 'number'
              ? { wearable_activity_minutes: params.aggregated.wearable.activityMinutes }
              : {}),
          }
        : {}
    ),
    fusion_reasons: reasons.join('; '),
  };

  return {
    ts: params.ts,
    correlationId: params.correlationId,
    userId: params.userId,
    features,
    confidence,
    sources,
  };
}

export function deriveSituationSnapshot(params: {
  tsStart: number;
  tsEnd: number;
  correlationId: string;
  userId: string;
  fused: FeatureVector;
  indicators?: {
    interruptionRatePerHour?: number;
  };
}): SituationSnapshot {
  const reasons: string[] = [];

  // Conservative: no hallucinated states. If confidence low, stay unknown.
  const conf = clamp01(params.fused.confidence);

  const load = (() => {
    if (conf < 0.35) return 'unknown';
    const hr = params.fused.features.wearable_hr_bpm;
    if (typeof hr === 'number' && hr > 110) {
      reasons.push('heart rate elevated');
      return 'high';
    }
    const speaking = params.fused.features.mic_speaking_ratio;
    if (typeof speaking === 'number' && speaking > 0.7) {
      reasons.push('sustained speaking ratio');
      return 'high';
    }
    return 'normal';
  })();

  const energy = (() => {
    if (conf < 0.35) return 'unknown';
    const hr = params.fused.features.wearable_hr_bpm;
    if (typeof hr === 'number' && hr < 55) {
      reasons.push('heart rate below typical active range');
      return 'low';
    }
    return 'normal';
  })();

  const focus = (() => {
    if (conf < 0.35) return 'unknown';

    const interrupts = params.indicators?.interruptionRatePerHour;
    if (typeof interrupts === 'number' && interrupts > 12) {
      reasons.push('high interruption rate');
      return 'low';
    }

    const motion = params.fused.features.cam_motion_energy_avg;
    if (typeof motion === 'number' && motion > 0.75) {
      reasons.push('high motion energy');
      return 'low';
    }

    return 'normal';
  })();

  return {
    tsStart: params.tsStart,
    tsEnd: params.tsEnd,
    correlationId: params.correlationId,
    userId: params.userId,
    fused: params.fused,
    derivedState: {
      energy,
      load,
      focus,
      confidence: conf,
      reasons,
    },
  };
}

export function fuseOnce(params: {
  tsStart: number;
  tsEnd: number;
  correlationId: string;
  userId: string;
  events: SensorEvent[];
}): SituationSnapshot {
  const aggregated = aggregateWindow({ tsStart: params.tsStart, tsEnd: params.tsEnd, events: params.events });
  const windowEvents = params.events.filter((e) => e.ts >= params.tsStart && e.ts <= params.tsEnd);
  const fused = buildFeatureVector({
    ts: params.tsEnd,
    correlationId: params.correlationId,
    userId: params.userId,
    aggregated,
    windowEvents,
  });

  return deriveSituationSnapshot({
    tsStart: params.tsStart,
    tsEnd: params.tsEnd,
    correlationId: params.correlationId,
    userId: params.userId,
    fused,
  });
}
