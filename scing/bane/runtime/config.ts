import type { BaneStore } from '../storage/baneStore';

export type BaneRuntimeConfig = {
  profileId: 'bane_fog_v1' | string;
  store?: BaneStore;
};
