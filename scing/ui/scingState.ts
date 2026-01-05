import type { HUDState } from './hudChannels';
import type { EngineHUDState } from './scingTypes';

export type ScingState = {
  engines: Record<string, EngineHUDState>;
  hud: HUDState;
  workflows: Record<string, any>;
  reports: Record<string, any>;
};

export const initialScingState: ScingState = {
  engines: {},
  hud: { channels: {} },
  workflows: {},
  reports: {},
};
