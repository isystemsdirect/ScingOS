import type { Risk } from "../../../shared/scing/delegation";

export function toRisk(value: unknown): Risk {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  if (v === "critical") return "critical";
  if (v === "high") return "high";
  if (v === "medium") return "medium";
  return "low";
}
