import type { WeatherHazard } from '../contracts/weatherSignal';

export type WeatherRegionKey = string;
export type WeatherIndustryKey = string;
export type WeatherDeploymentProfileKey = string;

export type HazardThresholdMatrix = {
  snowMmModerate: number; // >=
  snowMmHeavy: number; // >=

  iceMmModerate: number; // >=
  iceMmHeavy: number; // >=

  windGustKphLight: number; // >=
  windGustKphModerate: number; // >=
  windGustKphSevere: number; // >=

  heatFeelsLikeCLight: number; // >=
  heatFeelsLikeCModerate: number; // >=
  heatFeelsLikeCSevere: number; // >=

  fogVisibilityKmModerate: number; // <=
  fogVisibilityKmSevere: number; // <=
};

export type HazardWeights = Record<WeatherHazard, number>;

export type WeatherThresholdOverrides = Partial<{
  hazardThresholds: Partial<HazardThresholdMatrix>;
  hazardWeights: Partial<HazardWeights>;
  hardStopSeverityIndex: number;
}>;

export type WeatherThresholdProfile = {
  id: string;
  overrides: WeatherThresholdOverrides;
};

export type WeatherThresholdSet = {
  hazardThresholds: HazardThresholdMatrix;
  hazardWeights: HazardWeights;
  hardStopSeverityIndex: number;
};

export const DEFAULT_HARD_STOP_SEVERITY_INDEX = 8;

export const DEFAULT_HAZARD_THRESHOLDS: HazardThresholdMatrix = {
  snowMmModerate: 10,
  snowMmHeavy: 50,

  iceMmModerate: 2,
  iceMmHeavy: 5,

  windGustKphLight: 40,
  windGustKphModerate: 60,
  windGustKphSevere: 90,

  heatFeelsLikeCLight: 32,
  heatFeelsLikeCModerate: 38,
  heatFeelsLikeCSevere: 45,

  fogVisibilityKmModerate: 1,
  fogVisibilityKmSevere: 0.25,
};

export const DEFAULT_HAZARD_WEIGHTS: HazardWeights = {
  snow: 5.0,
  ice: 4.0,
  wind: 2.0,
  heat: 2.0,
  flood: 3.0,
  lightning: 3.0,
  fog: 1.0,
  hail: 2.0,
  tornado: 3.0,
  hurricane: 3.0,
  dust: 1.5,
  smoke: 1.5,
};

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export const resolveWeatherThresholds = (opts?: {
  profile?: WeatherThresholdOverrides;
  industry?: WeatherThresholdOverrides;
  region?: WeatherThresholdOverrides;
}): WeatherThresholdSet => {
  const base: WeatherThresholdSet = {
    hazardThresholds: { ...DEFAULT_HAZARD_THRESHOLDS },
    hazardWeights: { ...DEFAULT_HAZARD_WEIGHTS },
    hardStopSeverityIndex: DEFAULT_HARD_STOP_SEVERITY_INDEX,
  };

  const layers = [opts?.profile, opts?.industry, opts?.region].filter(Boolean) as WeatherThresholdOverrides[];
  for (const layer of layers) {
    if (layer.hazardThresholds) {
      base.hazardThresholds = { ...base.hazardThresholds, ...layer.hazardThresholds };
    }
    if (layer.hazardWeights) {
      base.hazardWeights = { ...base.hazardWeights, ...layer.hazardWeights } as HazardWeights;
    }
    if (isNumber(layer.hardStopSeverityIndex)) {
      base.hardStopSeverityIndex = layer.hardStopSeverityIndex;
    }
  }

  return base;
};
