import { createHash } from "crypto";

export function sha256Hex(value: any, len = 16): string {
  const h = createHash("sha256");
  h.update(JSON.stringify(value));
  return h.digest("hex").slice(0, len);
}
