export type WearableSourcePlatform =
  | 'ios_healthkit'
  | 'android_health_connect'
  | 'wearos_health_services';

export type WearableMetric =
  | 'heart_rate'
  | 'hrv'
  | 'sleep_summary'
  | 'steps'
  | 'activity_minutes'
  | 'workout_sessions'
  | 'respiration_rate'
  | 'skin_temp';

export type WearableMetricUnit =
  | 'bpm'
  | 'ms'
  | 'count'
  | 'minutes'
  | 'celsius'
  | 'fahrenheit'
  | 'ratio'
  | 'unknown';

export type WearableMetricValue =
  | number
  | {
      startTs: string;
      endTs: string;
      durationMinutes: number;
      stages?: Record<string, number>;
    }
  | {
      type: string;
      durationMinutes: number;
      calories?: number;
      distanceMeters?: number;
    };

export type WearableMetricEvent = {
  userId: string;
  ts: string;
  metric: WearableMetric;
  value: WearableMetricValue;
  unit: WearableMetricUnit;
  sourcePlatform: WearableSourcePlatform;
  deviceId?: string;
  confidence?: number; // 0..1, optional if platform provides
};
