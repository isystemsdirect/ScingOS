import { BaneKey, Stage } from './baneTypes';

export const KEY_STAGE_DEFAULT: Record<BaneKey, Stage> = {
  vision: 'A',
  mapper: 'A',
  dose: 'NA',
  prism: 'NA',
  echo: 'NA',
  gis: 'NA',
  weatherbot: 'NA',
  control: 'NA',
  therm: 'NA',
  nose: 'NA',
  sonic: 'NA',
  ground: 'NA',
  aegis: 'NA',
  eddy: 'NA',
};

// Canonical “capability” suggestions (extend freely)
export const KEY_CAPS: Record<BaneKey, string[]> = {
  vision: ['capture_builtin', 'ocr', 'watermark', 'detect_basic', 'external_cam_optional'],
  mapper: ['lidar_builtin', 'measure', 'mesh_basic', 'external_lidar_optional', 'registration_optional'],
  dose: ['drone_control', 'telemetry', 'capture_aerial', 'geofence', 'rtl'],
  prism: ['spectral_ingest', 'classify_materials', 'hazard_flags'],
  echo: ['sonar_ingest', 'acoustic_map', 'void_detect'],
  gis: ['maps', 'parcels', 'overlays', 'earth_engine_optional'],
  weatherbot: ['forecast', 'alerts', 'hazard_gates'],
  control: ['controller_bus', 'ccloop_edge', 'worm_logs'],
  therm: ['thermal_capture', 'anomaly_detect'],
  nose: ['gas_detect', 'threshold_alerts', 'evac_gate'],
  sonic: ['ndt_ultrasonic', 'thickness', 'crack_detect'],
  ground: ['gpr_map', 'buried_detect'],
  aegis: ['acoustic_emission', 'structural_health', 'alarm_gate'],
  eddy: ['eddy_current', 'corrosion_detect', 'coating_thickness'],
};
