import { createHash } from "crypto";

export function sha256Json(value: any): string {
  const h = createHash("sha256");
  h.update(JSON.stringify(value));
  return h.digest("hex");
}
