import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { requireDevKernel } from "../dev/_lib/requireDevKernel";
import { getRepoRoot } from "../dev/_lib/devKernel";
import { loadIntentState, appendIntentLedger } from "../../../lib/server/bfi/intentLedger";
import { simulateImpact } from "../../../lib/server/bfi/simulator";
import { persistSimulation } from "../../../lib/server/bfi/simulationLedger";
import { appendCognitiveMemory } from "../../../lib/server/bfi/memory/cognitiveMemory";
import { proposeActionPlan } from "../../../lib/server/scing/actions/proposeActionPlan";
import { getState } from "../../../lib/server/scing/store/coAwarenessStore";
import { toRisk } from "../../../lib/server/scing/coAwareness/riskMap";

const ReqSchema = z.object({
  intentId: z.string().min(1),
  iuPartnerId: z.string().min(1).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = ReqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const repoRoot = getRepoRoot();
  const intent = await loadIntentState(repoRoot, parsed.data.intentId);
  if (!intent) return res.status(404).json({ ok: false, error: "Intent not found" });

  if (intent.status !== "declared") {
    return res.status(409).json({
      ok: false,
      error: `Intent must be in 'declared' status to simulate (current: ${intent.status})`,
    });
  }

  const output = await simulateImpact(repoRoot, intent);
  const sim = await persistSimulation(repoRoot, intent, output);

  const updated = { ...intent, status: "simulated" as const };
  await appendIntentLedger(repoRoot, "intent.updated", updated);

  await appendCognitiveMemory(repoRoot, {
    ts: new Date().toISOString(),
    intent: updated,
    simulation: sim,
  });

  let actionPlan: any = null;
  if (parsed.data.iuPartnerId) {
    try {
      const state = getState(parsed.data.iuPartnerId);
      const risk = toRisk(output.estimatedRisk);
      actionPlan = proposeActionPlan({
        iuPartnerId: parsed.data.iuPartnerId,
        state,
        scope: state.delegation.scope,
        intentId: intent.id,
        description: `Propose IU-first delegated next action for intent: ${intent.description}`,
        simulation: {
          affectedFiles: output.affectedFiles,
          affectedEngines: output.affectedEngines,
          confidenceScore: output.confidenceScore,
        },
        estimatedRisk: risk,
      }).plan;
    } catch {
      actionPlan = null;
    }
  }

  return res.status(200).json({
    ok: true,
    intentId: intent.id,
    affectedFiles: output.affectedFiles,
    affectedEngines: output.affectedEngines,
    affectedPolicies: output.affectedPolicies || [],
    estimatedRisk: output.estimatedRisk,
    confidenceScore: output.confidenceScore,
    simulationHash: sim.simulationHash,
    explanation: output.explanation || null,
    actionPlan,
  });
}
