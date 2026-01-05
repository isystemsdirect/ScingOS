import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { requireDevKernel } from "../../../../lib/server/dev/requireDevKernel";
import { getRepoRoot } from "../../../../lib/server/dev/devKernel";
import { loadIntentState } from "../../../../lib/server/bfi/intentLedger";
import { simulateImpact } from "../../../../lib/server/bfi/simulator";
import { proposeActionPlan } from "../../../../lib/server/scing/actions/proposeActionPlan";
import { getState, appendAudit } from "../../../../lib/server/scing/store/coAwarenessStore";
import { toRisk } from "../../../../lib/server/scing/coAwareness/riskMap";

const ReqSchema = z
  .object({
    iuPartnerId: z.string().min(1),
    intentId: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .strict();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = ReqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const repoRoot = getRepoRoot();
  const state = getState(parsed.data.iuPartnerId);

  let sim = { affectedFiles: [] as string[], affectedEngines: [] as string[], confidenceScore: 1.0 };
  let estimatedRisk: string | undefined;

  if (parsed.data.intentId) {
    const intent = await loadIntentState(repoRoot, parsed.data.intentId);
    if (!intent) return res.status(404).json({ ok: false, error: "Intent not found" });
    const out = await simulateImpact(repoRoot, intent);
    sim = { affectedFiles: out.affectedFiles, affectedEngines: out.affectedEngines, confidenceScore: out.confidenceScore };
    estimatedRisk = out.estimatedRisk;
  }

  const risk = toRisk(estimatedRisk);
  const { plan, alternatives } = proposeActionPlan({
    iuPartnerId: parsed.data.iuPartnerId,
    state,
    scope: state.delegation.scope,
    intentId: parsed.data.intentId,
    description: parsed.data.description || "IU-first delegated proposal.",
    simulation: sim,
    estimatedRisk: risk,
  });

  appendAudit(parsed.data.iuPartnerId, { type: "actions.proposed", actor: ctx.actor, plan });
  return res.status(200).json({ ok: true, actionPlan: plan, alternatives });
}
