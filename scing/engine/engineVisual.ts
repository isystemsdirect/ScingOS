import { EngineId, VisualChannel } from './engineTypes';

export type EngineVisualBinding = {
  id: EngineId;
  channel: VisualChannel;
  priority: number; // higher wins when multiple active
};

export const VISUAL_BINDINGS: Record<EngineId, EngineVisualBinding> = {
  SCING: { id: 'SCING', channel: 'scing-present', priority: 10 },
  LARI: { id: 'LARI', channel: 'lari-thinking', priority: 50 },
  BANE: { id: 'BANE', channel: 'bane-alert', priority: 100 }, // override dominance

  'LARI-VISION': { id: 'LARI-VISION', channel: 'lari-thinking', priority: 40 },
  'LARI-MAPPER': { id: 'LARI-MAPPER', channel: 'lari-thinking', priority: 40 },
  'LARI-DOSE': { id: 'LARI-DOSE', channel: 'lari-thinking', priority: 45 },
  'LARI-PRISM': { id: 'LARI-PRISM', channel: 'lari-thinking', priority: 45 },
  'LARI-ECHO': { id: 'LARI-ECHO', channel: 'lari-thinking', priority: 45 },

  'LARI-WEATHERBOT': { id: 'LARI-WEATHERBOT', channel: 'lari-thinking', priority: 35 },
  'LARI-GIS': { id: 'LARI-GIS', channel: 'lari-thinking', priority: 35 },
  'LARI-CONTROL': { id: 'LARI-CONTROL', channel: 'lari-thinking', priority: 60 }, // control is high importance

  'LARI-THERM': { id: 'LARI-THERM', channel: 'lari-thinking', priority: 45 },
  'LARI-NOSE': { id: 'LARI-NOSE', channel: 'lari-thinking', priority: 45 },
  'LARI-SONIC': { id: 'LARI-SONIC', channel: 'lari-thinking', priority: 45 },
  'LARI-GROUND': { id: 'LARI-GROUND', channel: 'lari-thinking', priority: 45 },
  'LARI-AEGIS': { id: 'LARI-AEGIS', channel: 'lari-thinking', priority: 55 },
  'LARI-EDDY': { id: 'LARI-EDDY', channel: 'lari-thinking', priority: 45 },
};

export function resolveDominantChannel(active: EngineId[]): VisualChannel {
  let best: { ch: VisualChannel; p: number } = { ch: 'neutral', p: -1 };
  for (const id of active) {
    const b = VISUAL_BINDINGS[id];
    if (b && b.priority > best.p) best = { ch: b.channel, p: b.priority };
  }
  return best.ch;
}
