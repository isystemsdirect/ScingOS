export type EngineFamily = 'orchestrator' | 'lari' | 'lari-domain' | 'bane' | 'provider' | 'system';

// Add a more specific union for LARI "sub-babies"
export type LariSubEngineId = 'lari-core' | 'lari-ops' | 'lari-security' | 'lari-edl' | 'lari-cap'; // ← LARI-CAP (SpectroCAP™ orchestration engine)

// Global engine ids
export type EngineId =
  | 'scing-orchestrator'
  | 'lari-core'
  | 'lari-ops'
  | 'lari-security'
  | 'lari-edl'
  | 'lari-cap'
  | 'bane-core'
  | 'provider-openai'
  | 'provider-anthropic'
  | 'provider-anthropic-haiku'
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

  'provider-anthropic-haiku': {
    id: 'provider-anthropic-haiku',
    family: 'provider',
    displayName: 'Claude 3.5 Haiku (Anthropic)',
    description:
      'Fast, efficient reasoning and analysis via Anthropic Claude 3.5 Haiku. Default provider for general-purpose LARI tasks.',
    provider: 'internal',
    model: 'claude-3-5-haiku-20241022',
    supportsLongContext: true,
    supportsTools: false,
    supportsStreaming: true,
    tags: ['anthropic', 'claude', 'recommended', 'default'],
  },

  'lari-cap': {
    id: 'lari-cap',
    family: 'lari',
    subEngine: 'lari-cap',
    displayName: 'LARI-CAP (Capture-Analysis-Provision)',
    description:
      'SpectroCAP™ orchestration engine. Coordinates workflow authorization, verification, and finalization. Extensible for native ScingOS tools beyond SpectroCAP™.',
    provider: 'openai',
    model: 'gpt-5.1-thinking',
    supportsLongContext: true,
    supportsTools: true,
    supportsStreaming: true,
    requiresTrustedCaller: true,
    tags: ['lari-sub-engine', 'spectrocap', 'orchestrator', 'extensible'],
  },
};

export const LARI_SUB_ENGINES: Record<LariSubEngineId, EngineId> = {
  'lari-core': 'lari-core',
  'lari-ops': 'lari-ops',
  'lari-security': 'lari-security',
  'lari-edl': 'lari-edl',
  'lari-cap': 'lari-cap',
};

export default ENGINES;
