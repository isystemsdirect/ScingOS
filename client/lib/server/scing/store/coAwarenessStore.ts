import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";

import type { CoAwarenessState } from "../../../shared/scing/coAwareness";
import { DEFAULT_DELEGATION_SCOPE } from "../../../shared/scing/delegationDefaults";

const ROOT = path.join(process.cwd(), ".scing");
const STATE_DIR = path.join(ROOT, "state");
const AUDIT_DIR = path.join(ROOT, "audit");

type DeepPartial<T> = T extends (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

function ensureDirs() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

export function defaultState(iuPartnerId: string): CoAwarenessState {
  return {
    phase: "pre_imprint",
    partnerId: iuPartnerId,
    imprintReadiness: {
      score: 0,
      samples: 0,
      gates: { minSamplesMet: false, minScoreMet: false },
    },
    delegation: {
      mode: "assisted",
      scope: { ...DEFAULT_DELEGATION_SCOPE },
      bestOutcomeDefaults: false,
    },
    declaredAt: nowIso(),
  };
}

function stateFile(iuPartnerId: string) {
  return path.join(STATE_DIR, `${iuPartnerId}.json`);
}

function auditFile(iuPartnerId: string) {
  return path.join(AUDIT_DIR, `${iuPartnerId}.ndjson`);
}

export function getState(iuPartnerId: string): CoAwarenessState {
  ensureDirs();
  const p = stateFile(iuPartnerId);
  if (!fs.existsSync(p)) return defaultState(iuPartnerId);
  return JSON.parse(fs.readFileSync(p, "utf8")) as CoAwarenessState;
}

export function setState(iuPartnerId: string, patch: DeepPartial<CoAwarenessState>): CoAwarenessState {
  ensureDirs();
  const current = getState(iuPartnerId);

  const nextDelegation = patch.delegation
    ? {
        mode: patch.delegation.mode ?? current.delegation.mode,
        bestOutcomeDefaults: patch.delegation.bestOutcomeDefaults ?? current.delegation.bestOutcomeDefaults,
        scope: {
          ...current.delegation.scope,
          ...(patch.delegation.scope ?? {}),
          allowedPaths: patch.delegation.scope?.allowedPaths ?? current.delegation.scope.allowedPaths,
          blockedPaths: patch.delegation.scope?.blockedPaths ?? current.delegation.scope.blockedPaths,
        },
      }
    : current.delegation;

  const nextImprint = patch.imprintReadiness
    ? {
        score: patch.imprintReadiness.score ?? current.imprintReadiness.score,
        samples: patch.imprintReadiness.samples ?? current.imprintReadiness.samples,
        gates: {
          minSamplesMet: patch.imprintReadiness.gates?.minSamplesMet ?? current.imprintReadiness.gates.minSamplesMet,
          minScoreMet: patch.imprintReadiness.gates?.minScoreMet ?? current.imprintReadiness.gates.minScoreMet,
        },
      }
    : current.imprintReadiness;

  const merged: CoAwarenessState = {
    ...current,
    phase: patch.phase ?? current.phase,
    partnerId: iuPartnerId,
    imprintReadiness: nextImprint,
    delegation: nextDelegation,
    declaredAt: current.declaredAt,
    transitionedAt: patch.phase || patch.delegation || patch.imprintReadiness ? nowIso() : current.transitionedAt,
  };

  // HARD FALSE: auth secrets access is never allowed.
  merged.delegation.scope.canTouchAuthSecrets = false;

  fs.writeFileSync(stateFile(iuPartnerId), JSON.stringify(merged, null, 2) + "\n", "utf8");
  return merged;
}

export function appendAudit(iuPartnerId: string, record: unknown) {
  ensureDirs();
  const line = JSON.stringify({ id: crypto.randomUUID(), ts: nowIso(), ...(record as any) }) + "\n";
  fs.appendFileSync(auditFile(iuPartnerId), line, "utf8");
}

export function readAudit(iuPartnerId: string, limit = 50): any[] {
  ensureDirs();
  const p = auditFile(iuPartnerId);
  if (!fs.existsSync(p)) return [];
  const lines = fs.readFileSync(p, "utf8").split("\n").filter(Boolean);
  return lines.slice(-limit).map((l) => JSON.parse(l));
}
