import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { requireDevKernel } from "../../dev/_lib/requireDevKernel";
import { getRepoRoot } from "../../dev/_lib/devKernel";
import { loadIntentState, appendIntentLedger } from "../../../../lib/server/bfi/intentLedger";
import { evaluatePolicy } from "@scingular/bfi-policy";
import { persistPolicyDecision } from "../../../../lib/server/bfi/policyLedger";

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

  if (intent.status !== "simulated") {
    return res.status(409).json({
      ok: false,
      error: `Intent must be in 'simulated' status to evaluate policy (current: ${intent.status})`,
    });
  }

  const decision = evaluatePolicy({
    intent,
    actor: { id: ctx.actor.uid, role: ctx.actor.role, env: ctx.actor.env },
    system: { nodeEnv: process.env.NODE_ENV || "" },
  });

  const rec = await persistPolicyDecision(repoRoot, {
    intent,
    actor: { id: ctx.actor.uid, role: ctx.actor.role, env: ctx.actor.env },
    decision,
  });

  // Update intent status (no execution here).
  const nextStatus = decision.decision === "deny" ? "rejected" : "approved";
  const updated = { ...intent, status: nextStatus as any };
  await appendIntentLedger(repoRoot, "intent.updated", updated);

  return res.status(200).json({
    ok: true,
    intentId: intent.id,
    decision: decision.decision,
    reason: decision.reason,
    requiredConfirmations: decision.requiredConfirmations ?? 0,
    confidence: decision.decision === "allow" ? 0.85 : decision.decision === "warn" ? 0.7 : 0.9,
    decisionId: rec.decisionId,
  });
}
