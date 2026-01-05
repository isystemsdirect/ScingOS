import { CREATOR_STAMP } from "./creatorStamp";

export function assertProvenance(): void {
  if (!CREATOR_STAMP.creatorName || !CREATOR_STAMP.product) {
    throw new Error("Provenance stamp missing or invalid.");
  }
}
