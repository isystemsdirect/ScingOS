export const DEFAULT_HUES = {
  neutral: 200, // soft cyan/blue
  calm: 190, // teal
  focus: 35, // amber
  curious: 290, // violet
  joy: 55, // yellow-gold
  alert: 0, // red
  protective: 315, // magenta-red
  recovering: 210, // blue
} as const;

export const DEFAULT_THEME_WEIGHTS = {
  leadWeightRange: [0.55, 0.75] as const,
  supportWeightRange: [0.08, 0.22] as const,
  accentWeightRange: [0.02, 0.08] as const,
} as const;
