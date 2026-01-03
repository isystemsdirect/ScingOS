export type EngineTier = 'core' | 'key' | 'platform' | 'roadmap';
export type EngineRuntime = 'edge' | 'server' | 'hybrid';

export type EngineFamily =
  | 'scing' // presentation/reporting
  | 'lari' // central intelligence
  | 'bane' // security/enforcement
  | 'lari-key' // dedicated device-domain keys
  | 'lari-platform' // platform sub-engines (GIS, weather, control)
  | 'unknown';

export type RiskClass =
  | 'R0-info' // non-actionable info only
  | 'R1-low' // low consequence
  | 'R2-medium' // moderate consequence
  | 'R3-high' // safety/financial impact
  | 'R4-critical'; // could cause harm if incorrect

export type VisualChannel =
  | 'lari-thinking' // amber/gold/orange rhythms
  | 'lari-speaking' // full neon spectrum
  | 'bane-alert' // red-violet override
  | 'scing-present' // UI/reporting channel
  | 'neutral';

export type EngineStage = 'A' | 'B' | 'NA';

export type EngineCapability =
  | 'capture'
  | 'control'
  | 'analyze'
  | 'classify'
  | 'map'
  | 'report'
  | 'enforce'
  | 'ingest'
  | 'fuse'
  | 'audit';

export type EngineId =
  | 'SCING'
  | 'LARI'
  | 'BANE'
  | 'LARI-VISION'
  | 'LARI-MAPPER'
  | 'LARI-DOSE'
  | 'LARI-PRISM'
  | 'LARI-ECHO'
  | 'LARI-WEATHERBOT'
  | 'LARI-GIS'
  | 'LARI-CONTROL'
  | 'LARI-THERM'
  | 'LARI-NOSE'
  | 'LARI-SONIC'
  | 'LARI-GROUND'
  | 'LARI-AEGIS'
  | 'LARI-EDDY';
