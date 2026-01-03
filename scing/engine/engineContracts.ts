import { EngineId } from './engineTypes';

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export type EngineSignalEnvelope<T extends Json = Json> = {
  engineId: EngineId;
  version: string; // registry version at time of emit
  ts: string; // ISO timestamp
  traceId: string;
  payload: T;
};

export type EngineInputShape = {
  intent_vector?: Json;
  semantic_map?: Json;
  constraint_map?: Json;
  plan_graph?: Json;
  artifacts?: Json;
  telemetry?: Json;
  findings?: Json;
  classifications?: Json;
  geo?: Json;
  weather?: Json;
  map_layers?: Json;
  report_blocks?: Json;
  control_events?: Json;
  policy?: Json;
  policy_flags?: Json;
  audit_events?: Json;
  keys?: Json;
};

export type EngineOutputShape = {
  artifacts?: Json;
  telemetry?: Json;
  findings?: Json;
  classifications?: Json;
  map_layers?: Json;
  report_blocks?: Json;
  control_events?: Json;
  policy_flags?: Json;
  audit_events?: Json;
  weather?: Json;
};

export type EngineContract = {
  id: EngineId;
  input: (keyof EngineInputShape)[];
  output: (keyof EngineOutputShape)[];
  emitsSignals: boolean;
};

export const CONTRACTS: Record<EngineId, EngineContract> = {
  SCING: {
    id: 'SCING',
    input: ['artifacts', 'telemetry', 'findings', 'classifications', 'map_layers', 'policy'],
    output: ['report_blocks', 'audit_events'],
    emitsSignals: true,
  },
  LARI: {
    id: 'LARI',
    input: [
      'intent_vector',
      'semantic_map',
      'constraint_map',
      'artifacts',
      'telemetry',
      'geo',
      'weather',
      'policy',
      'keys',
    ],
    output: ['findings', 'classifications', 'policy_flags', 'audit_events'],
    emitsSignals: true,
  },
  BANE: {
    id: 'BANE',
    input: ['intent_vector', 'policy', 'keys', 'telemetry', 'geo', 'weather'],
    output: ['policy_flags', 'audit_events'],
    emitsSignals: true,
  },

  'LARI-VISION': {
    id: 'LARI-VISION',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['artifacts', 'findings', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-MAPPER': {
    id: 'LARI-MAPPER',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['artifacts', 'map_layers', 'findings', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-DOSE': {
    id: 'LARI-DOSE',
    input: ['telemetry', 'policy', 'keys', 'geo', 'weather'],
    output: ['artifacts', 'telemetry', 'control_events', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-PRISM': {
    id: 'LARI-PRISM',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['classifications', 'findings', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-ECHO': {
    id: 'LARI-ECHO',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['artifacts', 'map_layers', 'findings', 'audit_events'],
    emitsSignals: true,
  },

  'LARI-WEATHERBOT': {
    id: 'LARI-WEATHERBOT',
    input: ['geo', 'policy'],
    output: ['weather', 'policy_flags', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-GIS': {
    id: 'LARI-GIS',
    input: ['geo', 'artifacts', 'telemetry', 'policy'],
    output: ['map_layers', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-CONTROL': {
    id: 'LARI-CONTROL',
    input: ['telemetry', 'policy', 'keys', 'geo', 'weather'],
    output: ['control_events', 'audit_events'],
    emitsSignals: true,
  },

  'LARI-THERM': {
    id: 'LARI-THERM',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['artifacts', 'findings', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-NOSE': {
    id: 'LARI-NOSE',
    input: ['telemetry', 'policy', 'keys', 'geo'],
    output: ['findings', 'policy_flags', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-SONIC': {
    id: 'LARI-SONIC',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['findings', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-GROUND': {
    id: 'LARI-GROUND',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['map_layers', 'findings', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-AEGIS': {
    id: 'LARI-AEGIS',
    input: ['telemetry', 'policy', 'keys', 'geo'],
    output: ['findings', 'policy_flags', 'audit_events'],
    emitsSignals: true,
  },
  'LARI-EDDY': {
    id: 'LARI-EDDY',
    input: ['artifacts', 'telemetry', 'policy', 'keys', 'geo'],
    output: ['findings', 'audit_events'],
    emitsSignals: true,
  },
};
