export type GeoPoint = {
  lat: number;
  lon: number;
  tz?: string;
  elevationM?: number;
};

export type WeatherHazard =
  | 'snow'
  | 'ice'
  | 'heat'
  | 'wind'
  | 'flood'
  | 'lightning'
  | 'fog'
  | 'hail'
  | 'tornado'
  | 'hurricane'
  | 'dust'
  | 'smoke';

export type WeatherAlertSeverity = 'info' | 'caution' | 'critical';

export type WeatherSignalKind = 'current' | 'hourly' | 'daily' | 'alert';

export type WeatherSignal = {
  schemaVersion: '1.0';
  source: {
    provider: string;
    fetchedAtUtc: string;
    rawHash: string;
  };
  geo: GeoPoint;
  atUtc: string;
  kind: WeatherSignalKind;
  certaintyScore: number; // 0..1
  severityIndex: number; // 0..10
  metrics: {
    tempC?: number;
    feelsLikeC?: number;
    dewPointC?: number;
    humidityPct?: number;
    pressureHPa?: number;
    uvIndex?: number;
    visibilityKm?: number;
    windKph?: number;
    windGustKph?: number;
    windDeg?: number;
    precipType?: 'none' | 'rain' | 'snow' | 'sleet' | 'hail' | 'mixed';
    precipMmHr?: number;
    precipMm?: number;
    snowMm?: number;
    iceMm?: number;
    cloudPct?: number;
  };
  hazards: WeatherHazard[];
  alert?: {
    id: string;
    title: string;
    description?: string;
    severity: WeatherAlertSeverity;
    startsAtUtc?: string;
    endsAtUtc?: string;
    areas?: string[];
  };
};
