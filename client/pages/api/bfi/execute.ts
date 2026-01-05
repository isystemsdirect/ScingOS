import type { NextApiRequest, NextApiResponse } from "next";
import * as path from "path";
import { z } from "zod";
import { requireDevKernel } from "../dev/_lib/requireDevKernel";
import { getRepoRoot, truncate } from "../dev/_lib/devKernel";
import { appendAudit } from "../dev/_lib/audit";
import { loadIntentState, appendIntentLedger } from "../../../lib/server/bfi/intentLedger";
import { loadPolicyDecision } from "../../../lib/server/bfi/policyLedger";
import { loadSimulation } from "../../../lib/server/bfi/simulationLedger";
import { persistReflection } from "../../../lib/server/bfi/reflectionLedger";
import { appendCognitiveMemory } from "../../../lib/server/bfi/memory/cognitiveMemory";
import { scaffoldEngine } from "../../../lib/server/bfi/execEngineScaffold";
import { upsertEngineRegistry } from "../../../lib/server/bfi/registry";
import { runGit } from "../../../lib/server/bfi/git";

const ReqSchema = z.object({
  intentId: z.string().min(1),
  confirmHighRisk: z.boolean().optional(),
});

function toDisplayName(id: string) {
  return id
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function gitPath(repoRoot: string, p: string) {
  return path.relative(repoRoot, p).replace(/\\/g, "/");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = ReqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const repoRoot = getRepoRoot();
  const intent = await loadIntentState(repoRoot, parsed.data.intentId);
  if (!intent) return res.status(404).json({ ok: false, error: "Intent not found" });

  if (intent.status !== "approved") {
    return res.status(409).json({
      ok: false,
      error: `Intent must be in 'approved' status to execute (current: ${intent.status})`,
    });
  }

  const sim = await loadSimulation(repoRoot, intent.id);
  if (!sim) return res.status(409).json({ ok: false, error: "Missing simulation. Run /api/bfi/simulate first." });

  const policy = await loadPolicyDecision(repoRoot, intent.id);
  if (!policy) return res.status(409).json({ ok: false, error: "Missing policy decision. Run /api/bfi/policy/evaluate first." });

  if (policy.decision.decision === "deny") {
    return res.status(403).json({ ok: false, error: policy.decision.reason || "Blocked by policy" });
  }

  const requiresConfirm = (policy.decision.requiredConfirmations ?? 0) > 0 || intent.risk === "high";
  if (requiresConfirm && !parsed.data.confirmHighRisk) {
    return res.status(409).json({
      ok: false,
      error: "High-risk execution requires confirmation",
      requiredConfirmations: policy.decision.requiredConfirmations ?? 0,
    });
  }

  const startedAt = Date.now();

  // Refuse to commit if something is already staged.
  const preStaged = await runGit(repoRoot, ["diff", "--cached", "--name-only"]);
  if (preStaged.exitCode !== 0) {
    return res.status(500).json({ ok: false, error: truncate(preStaged.stderr || preStaged.stdout) });
  }
  if (preStaged.stdout.trim().length > 0) {
    return res.status(409).json({
      ok: false,
      error: "Refusing to execute: index has staged changes. Please commit/stash them first.",
      staged: preStaged.stdout.trim().split(/\r?\n/).filter(Boolean),
    });
  }

  // Governed patch: create a stub engine + upsert registry.
  const engineScaffold = await scaffoldEngine(repoRoot, intent.description);
  const registryWrite = await upsertEngineRegistry(repoRoot, {
    id: engineScaffold.id,
    name: toDisplayName(engineScaffold.id),
    purpose: intent.expectedOutcome || intent.description,
    cognitiveRole: "Category-proof demo engine",
    dependencies: [],
    failureModes: ["False positives", "Low confidence"],
    visualChannel: "console",
    policySurface: ["bfi"],
    confidenceScore: 0.5,
    lastReviewedAt: new Date().toISOString(),

    // Compatibility metadata
    family: "bfi-demo",
    version: "0.1.0",
  });

  const filesToAdd = [gitPath(repoRoot, engineScaffold.filePath), gitPath(repoRoot, registryWrite.filePath)];
  const addRes = await runGit(repoRoot, ["add", "--", ...filesToAdd]);
  if (addRes.exitCode !== 0) {
    return res.status(500).json({ ok: false, error: truncate(addRes.stderr || addRes.stdout) });
  }

  const summary = intent.description.trim().replace(/\s+/g, " ").slice(0, 72);
  const commitLines = {
    subject: `BFI: ${summary || intent.id}`,
    risk: `Risk: ${intent.risk}`,
    simulation: `Simulation: ${sim.simulationHash}`,
    policy: `Policy: ${policy.decisionId}`,
  };

  const commitRes = await runGit(repoRoot, [
    "commit",
    "-m",
    commitLines.subject,
    "-m",
    commitLines.risk,
    "-m",
    commitLines.simulation,
    "-m",
    commitLines.policy,
  ]);

  const execOk = commitRes.exitCode === 0;
  const durationMs = Date.now() - startedAt;

  await appendAudit({
    ts: new Date().toISOString(),
    action: "bfi.execute",
    ok: execOk,
    actor: { uid: ctx.actor.uid },
    meta: {
      intentId: intent.id,
      simulationHash: sim.simulationHash,
      decisionId: policy.decisionId,
      risk: intent.risk,
      files: filesToAdd,
      durationMs,
    },
  });

  const reflection = await persistReflection(repoRoot, {
    ts: new Date().toISOString(),
    intentId: intent.id,
    ok: execOk,
    unexpectedEffects: [],
    notes: execOk
      ? ["Governed execution created an engine scaffold + registry entry and committed atomically."]
      : ["Governed execution failed before completing commit."]
  });

  // Phase 2 learning loop: store structured memory.
  await appendCognitiveMemory(repoRoot, {
    ts: new Date().toISOString(),
    intent,
    simulation: sim,
    policy,
    execution: {
      ok: execOk,
      kind: "git.commit",
      commitStdout: truncate(commitRes.stdout),
      commitStderr: truncate(commitRes.stderr),
    },
    reflection,
  });

  if (execOk) {
    await appendIntentLedger(repoRoot, "intent.updated", { ...intent, status: "executed" });
  }

  return res.status(execOk ? 200 : 500).json({
    ok: execOk,
    commit: {
      message: commitLines,
      stdout: truncate(commitRes.stdout),
      stderr: truncate(commitRes.stderr),
    },
    artifacts: {
      engine: { id: engineScaffold.id, filePath: gitPath(repoRoot, engineScaffold.filePath), created: engineScaffold.created },
      registry: { filePath: gitPath(repoRoot, registryWrite.filePath) },
    },
    trace: {
      intentId: intent.id,
      simulationHash: sim.simulationHash,
      decisionId: policy.decisionId,
      durationMs,
    },
    reflection,
  });
}
