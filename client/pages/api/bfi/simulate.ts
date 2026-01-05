import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { requireDevKernel } from "../dev/_lib/requireDevKernel";
import { getRepoRoot } from "../dev/_lib/devKernel";
import { loadIntentState, appendIntentLedger } from "../../../lib/server/bfi/intentLedger";
import { simulateImpact } from "../../../lib/server/bfi/simulator";
import { persistSimulation } from "../../../lib/server/bfi/simulationLedger";

const ReqSchema = z.object({
  intentId: z.string().min(1),
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
  });
}
