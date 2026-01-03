export type EngineFamily = 'orchestrator' | 'lari' | 'lari-domain' | 'bane' | 'provider' | 'system';

// Add a more specific union for LARI "sub-babies"
export type LariSubEngineId = 'lari-core' | 'lari-ops' | 'lari-security' | 'lari-edl'; // ← LARI-EDL (Ecosystem Dynamic Library bridge)

// Global engine ids
export type EngineId =
  | 'scing-orchestrator'
  | 'lari-core'
  | 'lari-ops'
  | 'lari-security'
  | 'lari-edl'
  | 'bane-core'
  | 'provider-openai'
  | 'provider-anthropic'
  | 'provider-gemini'
  | 'system-metrics'
  | (string & {}); // allow future extension

export interface EngineConfig {
  id: EngineId;
  family: EngineFamily;
  subEngine?: LariSubEngineId | null;

  displayName: string;
  description: string;

  // Provider routing
  provider: 'openai' | 'vertex' | 'internal' | 'mock';
  model: string;

  // Capabilities
  supportsLongContext?: boolean;
  supportsTools?: boolean;
  supportsStreaming?: boolean;
  isExperimental?: boolean;

  // Security / routing flags
  requiresTrustedCaller?: boolean;
  allowedTenants?: string[];
  tags?: string[];
}

export const ENGINES: Record<string, EngineConfig> = {
  'lari-core': {
    id: 'lari-core',
    family: 'lari',
    subEngine: 'lari-core',
    displayName: 'LARI Core',
    description: 'Primary reasoning and orchestration core for SCINGULAR.',
    provider: 'openai',
    model: 'gpt-5.1-thinking',
    supportsLongContext: true,
    supportsTools: true,
    supportsStreaming: true,
    tags: ['primary', 'orchestrator'],
  },

  'lari-edl': {
    id: 'lari-edl',
    family: 'lari',
    subEngine: 'lari-edl',
    displayName: 'LARI-EDL — Ecosystem Dynamic Library Bridge',
    description:
      'LARI sub-engine specialized in reading, updating, and reasoning over the SCINGULAR Ecosystem Dynamic Library: glossary, avatar schemes, linkage graphs, and investor-facing narratives.',
    provider: 'openai',
    model: 'gpt-5.1-thinking',
    supportsLongContext: true,
    supportsTools: true,
    supportsStreaming: true,
    isExperimental: true,
    requiresTrustedCaller: true,
    tags: [
      'lari-sub-baby',
      'ecosystem-dynamic-library',
      'semantic-governance',
      'docs-intelligence',
    ],
  },
};

export const LARI_SUB_ENGINES: Record<LariSubEngineId, EngineId> = {
  'lari-core': 'lari-core',
  'lari-ops': 'lari-ops',
  'lari-security': 'lari-security',
  'lari-edl': 'lari-edl',
};

export default ENGINES;
