import type { NextApiRequest, NextApiResponse } from "next";
import { requireDevKernel, requireCapability } from "../dev/_lib/requireDevKernel";
import { Capabilities } from "@scingular/policy";
import { BfiPlanRequestSchema } from "./_lib/pipelineTypes";
import { simulate } from "./_lib/simulator";
import { sha256Json } from "./_lib/hash";
import { appendAudit } from "../dev/_lib/audit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;
  if (!requireCapability(res, ctx, Capabilities.RUN_TASKS)) return;

  const parsed = BfiPlanRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const { intent, action } = parsed.data;
  const simulation = simulate(intent, action);

  // Policy preview: reuse current policy decision (Phase 1: map action to capability).
  const cap = action.kind === "registry.upsert" ? Capabilities.UPDATE_REGISTRY : Capabilities.RUN_TASKS;
  const decisionId = sha256Json({ actor: ctx.actor, cap, intentId: intent.id }).slice(0, 16);

  // Decide using existing policy
  // NOTE: requireCapability already uses decide(); for preview we mirror by calling it through requireCapability at execute-time.
  const policyOk = true;

  const simulationHash = sha256Json({ intent, action, simulation }).slice(0, 16);

  await appendAudit({
    ts: new Date().toISOString(),
    action: "bfi.plan",
    ok: true,
    actor: { uid: ctx.actor.uid },
    meta: { intentId: intent.id, simulationHash, decisionId, actionKind: action.kind },
  });

  return res.status(200).json({
    ok: true,
    stages: {
      intent,
      simulation,
      policy: {
        ok: policyOk,
        decisionId,
      },
    },
    simulationHash,
  });
}
