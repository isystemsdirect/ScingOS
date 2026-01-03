import { EngineCapability, EngineFamily, EngineId, EngineRuntime, EngineStage, EngineTier } from './engineTypes';

export type EngineRecord = {
  id: EngineId;
  title: string;
  tier: EngineTier;
  family: EngineFamily;
  runtime: EngineRuntime;
  stage: EngineStage; // A/B/NA
  capabilities: EngineCapability[];
  description: string;
  dependsOn: EngineId[];
  providesKeys?: string[]; // entitlement handles like "vision.stage", "mapper.stage"
  flags: {
    enabledByDefault: boolean;
    canRunOffline: boolean;
    requiresExternalHardware: boolean;
  };
  version: {
    schema: string; // contract/schema version for this engine
    impl: string; // implementation version
  };
};

export const REGISTRY_VERSION = '1.0.0-canon';

export const ENGINE_REGISTRY: Record<EngineId, EngineRecord> = {
  SCING: {
    id: 'SCING',
    title: 'SCING Presentation & Reporting',
    tier: 'core',
    family: 'scing',
    runtime: 'hybrid',
    stage: 'NA',
    capabilities: ['report', 'audit'],
    description: 'UI/HUD + dynamic investor/regulator-grade reporting pipelines.',
    dependsOn: ['LARI', 'BANE'],
    flags: { enabledByDefault: true, canRunOffline: true, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  LARI: {
    id: 'LARI',
    title: 'Learning & Adaptive Regulatory Intelligence',
    tier: 'core',
    family: 'lari',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['analyze', 'classify', 'fuse', 'audit'],
    description: 'Central intelligence: fuses sensor data and codes/standards into decisions + guidance.',
    dependsOn: ['BANE'],
    flags: { enabledByDefault: true, canRunOffline: false, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  BANE: {
    id: 'BANE',
    title: 'Boundary, Authorization & Network Enforcement',
    tier: 'core',
    family: 'bane',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['enforce', 'audit'],
    description: 'Security, licensing keys, zero-trust enforcement, chain-of-custody controls.',
    dependsOn: [],
    flags: { enabledByDefault: true, canRunOffline: false, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-VISION': {
    id: 'LARI-VISION',
    title: 'Vision Key',
    tier: 'key',
    family: 'lari-key',
    runtime: 'hybrid',
    stage: 'A',
    capabilities: ['capture', 'analyze', 'audit'],
    description: 'Camera/video capture + on-device detection + OCR + evidence watermarking; Stage B adds external camera adapters.',
    dependsOn: ['BANE', 'LARI'],
    providesKeys: ['vision.stage'],
    flags: { enabledByDefault: true, canRunOffline: true, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-MAPPER': {
    id: 'LARI-MAPPER',
    title: 'Mapper (LiDAR) Key',
    tier: 'key',
    family: 'lari-key',
    runtime: 'hybrid',
    stage: 'A',
    capabilities: ['capture', 'map', 'analyze', 'audit'],
    description: 'On-device LiDAR/ToF mapping (Stage A) and external LiDAR rigs (Stage B) with GIS alignment.',
    dependsOn: ['BANE', 'LARI', 'LARI-GIS'],
    providesKeys: ['mapper.stage'],
    flags: { enabledByDefault: true, canRunOffline: true, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-DOSE': {
    id: 'LARI-DOSE',
    title: 'Drone Key',
    tier: 'key',
    family: 'lari-key',
    runtime: 'hybrid',
    stage: 'NA',
    capabilities: ['capture', 'control', 'map', 'audit'],
    description: 'Aerial imagery + telemetry collection with safety gates (weather/geofence); integrates closed-loop control.',
    dependsOn: ['BANE', 'LARI', 'LARI-CONTROL', 'LARI-WEATHERBOT', 'LARI-GIS'],
    providesKeys: ['dose.enabled'],
    flags: { enabledByDefault: false, canRunOffline: true, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-PRISM': {
    id: 'LARI-PRISM',
    title: 'Spectrometer Key',
    tier: 'key',
    family: 'lari-key',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['ingest', 'classify', 'audit'],
    description: 'Material/chemical composition classification from spectral inputs.',
    dependsOn: ['BANE', 'LARI'],
    providesKeys: ['prism.enabled'],
    flags: { enabledByDefault: false, canRunOffline: false, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-ECHO': {
    id: 'LARI-ECHO',
    title: 'Sonar Key',
    tier: 'key',
    family: 'lari-key',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['ingest', 'map', 'analyze', 'audit'],
    description: 'Acoustic imaging for hidden/submerged structure mapping and defect detection.',
    dependsOn: ['BANE', 'LARI', 'LARI-GIS'],
    providesKeys: ['echo.enabled'],
    flags: { enabledByDefault: false, canRunOffline: false, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-CONTROL': {
    id: 'LARI-CONTROL',
    title: 'CCLoop Control Plane',
    tier: 'platform',
    family: 'lari-platform',
    runtime: 'edge',
    stage: 'NA',
    capabilities: ['control', 'enforce', 'audit'],
    description: 'Edge-only hot loop controller bus for safe device control; async signed telemetry to server.',
    dependsOn: ['BANE'],
    flags: { enabledByDefault: true, canRunOffline: true, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-WEATHERBOT': {
    id: 'LARI-WEATHERBOT',
    title: 'Weather & Hazard Sub-Engine',
    tier: 'platform',
    family: 'lari-platform',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['ingest', 'analyze', 'enforce', 'audit'],
    description: 'Authoritative weather/hazard ingestion and normalization for safety gating and report context.',
    dependsOn: ['BANE'],
    flags: { enabledByDefault: true, canRunOffline: false, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  'LARI-GIS': {
    id: 'LARI-GIS',
    title: 'Geospatial Sub-Engine',
    tier: 'platform',
    family: 'lari-platform',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['ingest', 'fuse', 'map', 'audit'],
    description: 'Geospatial fusion: maps/parcels/overlays; aligns LiDAR/drone/sonar outputs to ground truth.',
    dependsOn: ['BANE'],
    flags: { enabledByDefault: true, canRunOffline: false, requiresExternalHardware: false },
    version: { schema: '1.0.0', impl: '0.1.0' },
  },

  // Roadmap keys (present in registry now; enabled later)
  'LARI-THERM': {
    id: 'LARI-THERM',
    title: 'Thermal Imaging Key',
    tier: 'roadmap',
    family: 'lari-key',
    runtime: 'hybrid',
    stage: 'NA',
    capabilities: ['capture', 'analyze', 'audit'],
    description: 'Infrared thermal capture + anomaly detection.',
    dependsOn: ['BANE', 'LARI', 'LARI-GIS'],
    providesKeys: ['therm.enabled'],
    flags: { enabledByDefault: false, canRunOffline: true, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.0.0' },
  },

  'LARI-NOSE': {
    id: 'LARI-NOSE',
    title: 'Gas Sniffer Key',
    tier: 'roadmap',
    family: 'lari-key',
    runtime: 'hybrid',
    stage: 'NA',
    capabilities: ['ingest', 'analyze', 'enforce', 'audit'],
    description: 'Real-time gas detection + concentration thresholds + alerts.',
    dependsOn: ['BANE', 'LARI', 'LARI-CONTROL', 'LARI-WEATHERBOT'],
    providesKeys: ['nose.enabled'],
    flags: { enabledByDefault: false, canRunOffline: true, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.0.0' },
  },

  'LARI-SONIC': {
    id: 'LARI-SONIC',
    title: 'Ultrasonic NDT Key',
    tier: 'roadmap',
    family: 'lari-key',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['ingest', 'analyze', 'audit'],
    description: 'Ultrasonic non-destructive testing for thickness/cracks/weld integrity.',
    dependsOn: ['BANE', 'LARI'],
    providesKeys: ['sonic.enabled'],
    flags: { enabledByDefault: false, canRunOffline: false, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.0.0' },
  },

  'LARI-GROUND': {
    id: 'LARI-GROUND',
    title: 'Ground-Penetrating Radar Key',
    tier: 'roadmap',
    family: 'lari-key',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['ingest', 'map', 'analyze', 'audit'],
    description: 'Subsurface mapping and buried object/void detection.',
    dependsOn: ['BANE', 'LARI', 'LARI-GIS'],
    providesKeys: ['ground.enabled'],
    flags: { enabledByDefault: false, canRunOffline: false, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.0.0' },
  },

  'LARI-AEGIS': {
    id: 'LARI-AEGIS',
    title: 'Acoustic Emission Key',
    tier: 'roadmap',
    family: 'lari-key',
    runtime: 'hybrid',
    stage: 'NA',
    capabilities: ['ingest', 'analyze', 'enforce', 'audit'],
    description: 'Structural health monitoring from stress-wave emissions.',
    dependsOn: ['BANE', 'LARI', 'LARI-CONTROL'],
    providesKeys: ['aegis.enabled'],
    flags: { enabledByDefault: false, canRunOffline: true, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.0.0' },
  },

  'LARI-EDDY': {
    id: 'LARI-EDDY',
    title: 'Eddy Current Key',
    tier: 'roadmap',
    family: 'lari-key',
    runtime: 'server',
    stage: 'NA',
    capabilities: ['ingest', 'analyze', 'audit'],
    description: 'Magnetic induction testing for cracks/corrosion/coating thickness.',
    dependsOn: ['BANE', 'LARI'],
    providesKeys: ['eddy.enabled'],
    flags: { enabledByDefault: false, canRunOffline: false, requiresExternalHardware: true },
    version: { schema: '1.0.0', impl: '0.0.0' },
  },
};
