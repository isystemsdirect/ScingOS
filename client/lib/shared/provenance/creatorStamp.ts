export type CreatorStamp = {
  product: string;
  system?: string;
  repo?: string;
  build?: {
    node?: string;
    next?: string;
    commit?: string;
    ts?: string;
    timestamp?: string;
  };
  creatorName?: string;
  copyrightHolder?: string;
  statement?: string;
  creatorSignature?: string; // non-personal placeholder only
};

export const CREATOR_STAMP: CreatorStamp = Object.freeze({
  product: "SCINGULAR / ScingOS",
  system: process.env.NEXT_PUBLIC_SYSTEM_NAME ?? "ScingOS",
  repo: "isystemsdirect/ScingOS",
  build: {
    node: process.env.NEXT_PUBLIC_BUILD_NODE ?? undefined,
    next: process.env.NEXT_PUBLIC_BUILD_NEXT ?? undefined,
    commit: process.env.NEXT_PUBLIC_BUILD_COMMIT ?? undefined,
    ts: process.env.NEXT_PUBLIC_BUILD_TS ?? undefined,
    timestamp: process.env.NEXT_PUBLIC_BUILD_TIME ?? undefined,
  },
  creatorName: process.env.NEXT_PUBLIC_CREATOR_NAME ?? "SCINGULAR",
  copyrightHolder: process.env.NEXT_PUBLIC_COPYRIGHT_HOLDER ?? "SCINGULAR",
  statement: process.env.NEXT_PUBLIC_COPYRIGHT_STATEMENT ?? "All rights reserved.",
  creatorSignature: process.env.NEXT_PUBLIC_CREATOR_SIGNATURE ?? "origin:scingular",
});
