export const CREATOR_STAMP = Object.freeze({
  creatorName: "Inspection Systems Direct LLC",
  product: "SCINGULAR",
  system: "ScingOS",
  createdBy: "ISD-C",
  copyrightHolder: "Inspection Systems Direct LLC",
  statement: "SCINGULAR Bona Fide Intelligence (BFI) platform.",
  // Optional:
  // support: "support@yourdomain.com",
  // uri: "https://yourdomain.com",
} as const);

export type CreatorStamp = typeof CREATOR_STAMP;
