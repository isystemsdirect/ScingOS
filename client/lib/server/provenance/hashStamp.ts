import crypto from "node:crypto";
import { CREATOR_STAMP } from "../../shared/provenance/creatorStamp";

export function hashCreatorStamp(): string {
  const json = JSON.stringify(CREATOR_STAMP);
  return crypto.createHash("sha256").update(json, "utf8").digest("hex");
}
