export type EngineFamily = 'orchestrator' | 'cognition' | 'expression' | 'subengine';

export type EngineRecord = {
  id: string;
  family: EngineFamily;
  description: string;
  enabled: boolean;
};

export const engineRegistry: EngineRecord[] = [
  {
    id: 'srt-core',
    family: 'expression',
    description: 'SRT federation + influence field + motif constraints',
    enabled: true,
  },
];
