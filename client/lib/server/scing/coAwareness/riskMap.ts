import type { Risk } from "../../../shared/scing/delegation";

export function toRisk(value: unknown): Risk {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  if (v === "low" || v === "medium" || v === "high" || v === "critical") return v;
  return "medium";
}
