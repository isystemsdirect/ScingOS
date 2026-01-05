import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";

import type { MobiusConfig, MobiusTickRequest, MobiusTickResult, MobiusPhaseResult, MobiusRisk } from "../../shared/mobius/mobius.types";
import { DEFAULT_MOBIUS_CONFIG } from "../../shared/mobius/mobius.types";

import { getState, appendAudit, readAudit } from "../scing/store/coAwarenessStore";
import { proposeActionPlan } from "../scing/actions/proposeActionPlan";
import { enforceDelegation } from "../scing/delegation/enforceDelegation";
import { riskLeq } from "../scing/bestOutcomePolicy";

import { simulateImpact } from "../bfi/simulator";
import { loadIntentState, appendIntentLedger } from "../bfi/intentLedger";

type MobiusConfigPatch = Partial<Pick<MobiusConfig, "enabled" | "mode" | "minConfidenceToAct" | "maxAutoRisk" | "tickIntervalMs">>;

function getRepoRoot(): string {
  const cwd = process.cwd();
  return path.basename(cwd) === "client" ? path.resolve(cwd, "..") : cwd;
}

function scingRoot(): string {
  // Must remain under client/.scing (gitignored).
  const cwd = process.cwd();
  const clientDir = path.basename(cwd) === "client" ? cwd : path.join(cwd, "client");
  return path.join(clientDir, ".scing");
}

function ensureMobiusDir() {
  const dir = path.join(scingRoot(), "mobius");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function mobiusConfigFile(iuPartnerId: string) {
  return path.join(ensureMobiusDir(), `${iuPartnerId}.json`);
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function loadMobiusConfig(iuPartnerId: string): MobiusConfig {
  const p = mobiusConfigFile(iuPartnerId);
  if (!fs.existsSync(p)) return { ...DEFAULT_MOBIUS_CONFIG };
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8")) as Partial<MobiusConfig>;
    return {
      enabled: raw.enabled ?? DEFAULT_MOBIUS_CONFIG.enabled,
      mode: raw.mode ?? DEFAULT_MOBIUS_CONFIG.mode,
      tickIntervalMs: raw.tickIntervalMs,
      minConfidenceToAct: clamp(raw.minConfidenceToAct ?? DEFAULT_MOBIUS_CONFIG.minConfidenceToAct, 0, 1),
      maxAutoRisk: (raw.maxAutoRisk ?? DEFAULT_MOBIUS_CONFIG.maxAutoRisk) as MobiusRisk,
    };
  } catch {
    return { ...DEFAULT_MOBIUS_CONFIG };
  }
}

export function saveMobiusConfig(iuPartnerId: string, patch: MobiusConfigPatch): MobiusConfig {
  const current = loadMobiusConfig(iuPartnerId);
  const next: MobiusConfig = {
    ...current,
    ...patch,
    minConfidenceToAct: clamp(
      patch.minConfidenceToAct ?? current.minConfidenceToAct,
      0,
      1
    ),
  };
  fs.writeFileSync(mobiusConfigFile(iuPartnerId), JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

function phaseResult(phase: MobiusPhaseResult["phase"], ok: boolean, note?: string, data?: unknown): MobiusPhaseResult {
  return { phase, ok, note, data };
}

function nowIso() {
  return new Date().toISOString();
}

function runCommand(args: { cwd: string; cmd: string; cmdArgs: string[]; env?: NodeJS.ProcessEnv }) {
  return new Promise<{ code: number | null; out: string }>((resolve) => {
    const env = {
      ...process.env,
      ...(args.env ?? {}),
      SystemRoot: process.env.SystemRoot || process.env.SYSTEMROOT || "C:\\Windows",
      ComSpec: process.env.ComSpec || process.env.COMSPEC || "C:\\Windows\\System32\\cmd.exe",
    };

    const p = spawn(args.cmd, args.cmdArgs, { cwd: args.cwd, shell: false, env });
    let out = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (out += d.toString()));
    p.on("close", (code) => resolve({ code, out }));
  });
}

async function runBoundedDevTasks(repoRoot: string) {
  const maxOut = 20000;
  const outputs: { cmd: string; code: number | null; out: string }[] = [];

  const tc = await runCommand({
    cwd: repoRoot,
    cmd: "cmd.exe",
    cmdArgs: ["/c", "npm.cmd --prefix .\\client run type-check -- --pretty false"],
    env: { NODE_ENV: "production" },
  });
  outputs.push({ cmd: "npm.cmd --prefix .\\client run type-check", code: tc.code, out: tc.out.slice(-maxOut) });

  const build = await runCommand({
    cwd: repoRoot,
    cmd: "cmd.exe",
    cmdArgs: ["/c", "npm.cmd --prefix .\\client run build"],
    env: { NODE_ENV: "production" },
  });
  outputs.push({ cmd: "npm.cmd --prefix .\\client run build", code: build.code, out: build.out.slice(-maxOut) });

  const ok = outputs.every((o) => o.code === 0);
  return { ok, outputs };
}

export async function tickMobius(req: MobiusTickRequest): Promise<MobiusTickResult> {
  const phaseResults: MobiusPhaseResult[] = [];
  const iuPartnerId = req.iuPartnerId;

  // A) Perceive
  const state = getState(iuPartnerId);
  if (state.phase !== "co_aware") {
    phaseResults.push(phaseResult("perceive", false, "Not Co-Aware", { phase: state.phase }));
    const auditId = crypto.randomUUID();
    appendAudit(iuPartnerId, {
      id: auditId,
      type: "mobius.tick",
      ts: nowIso(),
      ok: false,
      reason: "Not Co-Aware",
      phases: phaseResults,
    });
    return { ok: false, reason: "Not Co-Aware", phaseResults, executed: false, auditId };
  }
  phaseResults.push(phaseResult("perceive", true, "Co-Aware", { delegationMode: state.delegation.mode }));

  // Enforce delegated mode (governance gate)
  if (state.delegation.mode !== "delegated") {
    phaseResults.push(phaseResult("interpret", false, "Delegation mode is not delegated"));
    const auditId = crypto.randomUUID();
    appendAudit(iuPartnerId, {
      id: auditId,
      type: "mobius.tick",
      ts: nowIso(),
      ok: false,
      reason: "Delegation mode is not delegated",
      phases: phaseResults,
    });
    return { ok: false, reason: "Delegation mode is not delegated", phaseResults, executed: false, auditId };
  }

  // B) Interpret (lightweight: last audit event summary)
  const lastAudit = readAudit(iuPartnerId, 1)[0] ?? null;
  phaseResults.push(
    phaseResult("interpret", true, lastAudit ? `Last audit: ${lastAudit.type}` : "No prior audit", {
      lastAuditType: lastAudit?.type ?? null,
      lastAuditTs: lastAudit?.ts ?? null,
    })
  );

  // C) Simulate
  const repoRoot = getRepoRoot();
  let intentId = req.intentId;
  let simOut: any = null;

  if (intentId) {
    const intent = await loadIntentState(repoRoot, intentId);
    if (!intent) {
      phaseResults.push(phaseResult("simulate", false, "Intent not found", { intentId }));
      const auditId = crypto.randomUUID();
      appendAudit(iuPartnerId, {
        id: auditId,
        type: "mobius.tick",
        ts: nowIso(),
        ok: false,
        reason: "Intent not found",
        phases: phaseResults,
      });
      return { ok: false, reason: "Intent not found", phaseResults, executed: false, auditId };
    }

    simOut = await simulateImpact(repoRoot, intent);
    phaseResults.push(
      phaseResult("simulate", true, "Simulated existing intent", {
        intentId,
        estimatedRisk: simOut.estimatedRisk,
        confidenceScore: simOut.confidenceScore,
      })
    );
  } else if (req.description && req.description.trim().length) {
    // Internal intent creation (no API hop)
    const createdAt = nowIso();
    intentId = `bfi-${Date.now()}`;
    const intent = {
      id: intentId,
      createdAt,
      author: "mobius",
      description: req.description.trim(),
      scope: "infra" as const,
      risk: "medium" as const,
      expectedOutcome: "",
      rollbackPlan: "",
      status: "declared" as const,
    };

    await appendIntentLedger(repoRoot, "intent.declared", intent as any);

    simOut = await simulateImpact(repoRoot, intent as any);
    phaseResults.push(
      phaseResult("simulate", true, "Declared+simulated description", {
        intentId,
        estimatedRisk: simOut.estimatedRisk,
        confidenceScore: simOut.confidenceScore,
      })
    );
  } else {
    phaseResults.push(phaseResult("simulate", false, "Provide intentId or description"));
    const auditId = crypto.randomUUID();
    appendAudit(iuPartnerId, {
      id: auditId,
      type: "mobius.tick",
      ts: nowIso(),
      ok: false,
      reason: "Provide intentId or description",
      phases: phaseResults,
    });
    return { ok: false, reason: "Provide intentId or description", phaseResults, executed: false, auditId };
  }

  // D) Decide
  const risk = (simOut?.estimatedRisk ?? "medium") as MobiusRisk;
  const { plan } = proposeActionPlan({
    iuPartnerId,
    state,
    scope: state.delegation.scope,
    intentId,
    description: `Mobius tick decision for: ${req.description ?? intentId}`,
    simulation: {
      affectedFiles: simOut?.affectedFiles ?? [],
      affectedEngines: simOut?.affectedEngines ?? [],
      confidenceScore: simOut?.confidenceScore ?? 0,
    },
    estimatedRisk: risk as any,
  });

  const config = loadMobiusConfig(iuPartnerId);
  const confidence = plan?.predictedImpact?.confidenceScore ?? 0;
  const delegated = enforceDelegation(state, state.delegation.scope, plan as any, {
    pathsTouched: plan?.predictedImpact?.affectedFiles ?? [],
    minConfidence: config.minConfidenceToAct,
  });

  phaseResults.push(
    phaseResult("decide", true, "Proposed action plan", {
      planKind: (plan as any)?.kind,
      planRisk: (plan as any)?.risk,
      decision: delegated.decision,
      reason: delegated.reason,
      confidence,
      minConfidenceToAct: config.minConfidenceToAct,
    })
  );

  // E) Act (bounded)
  let executed = false;
  let outputs: any = null;

  const canRisk = riskLeq((plan as any)?.risk ?? "critical", config.maxAutoRisk as any);
  const modeAllows = config.mode === "manual_tick";

  if (config.enabled && modeAllows && delegated.decision === "auto_execute" && canRisk) {
    if ((plan as any)?.kind === "run_task") {
      const run = await runBoundedDevTasks(repoRoot);
      executed = run.ok;
      outputs = run.outputs.map((o) => ({ cmd: o.cmd, code: o.code }));
      phaseResults.push(phaseResult("act", run.ok, run.ok ? "Executed run_task" : "run_task failed", outputs));
    } else {
      phaseResults.push(phaseResult("act", false, "Execution is limited to run_task for now"));
    }
  } else {
    phaseResults.push(
      phaseResult(
        "act",
        true,
        "No auto-act (disabled or gated)",
        {
          enabled: config.enabled,
          mode: config.mode,
          delegationDecision: delegated.decision,
          riskOk: canRisk,
        }
      )
    );
  }

  // F) Reflect
  const auditId = crypto.randomUUID();
  appendAudit(iuPartnerId, {
    id: auditId,
    type: "mobius.tick",
    ts: nowIso(),
    ok: true,
    intentId,
    phases: phaseResults,
    actionPlan: { id: (plan as any)?.id, kind: (plan as any)?.kind, risk: (plan as any)?.risk },
    executed,
    outputs,
  });
  phaseResults.push(phaseResult("reflect", true, "Audit appended", { auditId }));

  return { ok: true, phaseResults, actionPlan: plan, executed, auditId };
}
