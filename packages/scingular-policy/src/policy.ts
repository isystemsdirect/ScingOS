import type { Actor, PolicyDecision } from "./types";
import { Capabilities, type Capability } from "./capabilities";

// Safe-by-default policy: prod is locked down unless explicitly allowed.
export function decide(actor: Actor, cap: Capability): PolicyDecision {
  if (actor.role === "viewer") {
    return { ok: false, reason: "Viewer role cannot perform privileged actions." };
  }

  if (actor.env === "prod") {
    if (cap === Capabilities.GIT_PUSH) return { ok: false, reason: "GIT_PUSH disabled in prod." };
    if (cap === Capabilities.REPO_WRITE) return { ok: false, reason: "REPO_WRITE disabled in prod." };
    if (cap === Capabilities.MIGRATE_DB) return { ok: false, reason: "MIGRATE_DB disabled in prod." };
  }

  // Dev/stage allowed for dev/owner:
  return { ok: true };
}
