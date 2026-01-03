import type { EngineHUDPayload } from './scingTypes';

export type HUDChannel = {
  channelId: string;
  engineId: string;
  payload: EngineHUDPayload;
  updatedAt: string;
};

export type HUDState = {
  channels: Record<string, HUDChannel>;
};

export function upsertHUD(state: HUDState, channel: HUDChannel): HUDState {
  return {
    channels: {
      ...state.channels,
      [channel.channelId]: channel,
    },
  };
}
