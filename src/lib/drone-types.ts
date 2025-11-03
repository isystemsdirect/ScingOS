
export interface DroneStatus {
  flightMode: 'STANDBY' | 'ARMED' | 'TAKING_OFF' | 'IN_FLIGHT' | 'LANDING';
  battery: number;
  diagnostics: Record<string, boolean>;
  recentActivities: ActivityLog[];
  flightConfig: FlightConfig;
  lariStatus: {
    autonomous: boolean;
    mission: string;
  };
  faaCompliance: ComplianceStatus;
}

export interface SensorData {
  altitude?: number;
  imu?: { pitch: number; roll: number; yaw: number };
  gps?: { satellites: number; lat: number; lon: number };
  barometer?: { pressure: number; temperature: number };
  camera?: { status: string; resolution: string; fps: number };
  thermal?: { temp_min: number; temp_max: number };
  lidar?: { range: number; points: number };
  wind?: { speed: number; direction: number };
  power?: { voltage: number; current: number };
  ecu?: { rpm: number; temp: number };
}

export interface DroneConfig {
    pidTuning: {
        pitch: { p: number; i: number; d: number };
        roll: { p: number; i: number; d: number };
        yaw: { p: number; i: number; d: number };
    };
    flightModes: Record<string, string>;
}

export interface FlightConfig {
  currentMode: string;
}

export interface ComplianceStatus {
  aiCertified: boolean;
}

export interface SensorConfig {
  [key: string]: {
    enabled: boolean;
    [key: string]: any;
  }
}

export interface ActivityLog {
  timestamp: string;
  message: string;
}
