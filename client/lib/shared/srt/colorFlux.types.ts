export type HueTag =
  | "joy"
  | "calm"
  | "focus"
  | "curious"
  | "alert"
  | "protective"
  | "recovering"
  | "neutral";

export type FluxLayer = {
  tag: HueTag;
  hueDeg: number;
  weight: number;
  chroma: number;
  lightness: number;
  alpha: number;
};

export type ColorFlux = {
  ts: number;
  lead: FluxLayer;
  supports: FluxLayer[];
  accents: FluxLayer[];
  notes?: string[];
};
