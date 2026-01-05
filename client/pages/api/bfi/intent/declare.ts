import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import type { BFIIntent, IntentRisk, IntentScope } from "@scingular/bfi-intent";
import { requireDevKernel } from "../../dev/_lib/requireDevKernel";
import { getRepoRoot } from "../../dev/_lib/devKernel";
import { appendIntentLedger } from "../../../../lib/server/bfi/intentLedger";

const DeclareReqSchema = z.object({
  description: z.string().min(1),
  author: z.string().optional(),
  scope: z.enum(["engine", "registry", "policy", "ui", "infra"]).optional(),
  risk: z.enum(["low", "medium", "high"]).optional(),
  expectedOutcome: z.string().optional(),
  rollbackPlan: z.string().optional(),
});

type DeclareReq = z.infer<typeof DeclareReqSchema>;

function inferScope(desc: string): IntentScope {
  const d = desc.toLowerCase();
  if (d.includes("policy")) return "policy";
  if (d.includes("registry")) return "registry";
  if (d.includes("ui") || d.includes("console")) return "ui";
  if (d.includes("infra") || d.includes("deploy") || d.includes("build")) return "infra";
  return "engine";
}

function inferRisk(desc: string, scope: IntentScope): IntentRisk {
  const d = desc.toLowerCase();
  if (d.includes("delete") || d.includes("remove") || d.includes("prod")) return "high";
  if (scope === "policy" || scope === "infra") return "medium";
  return "medium";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = DeclareReqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });
  const body: DeclareReq = parsed.data;

  const scope = body.scope ?? inferScope(body.description);
  const risk = body.risk ?? inferRisk(body.description, scope);

  const now = new Date().toISOString();
  const intent: BFIIntent = {
    id: `bfi-${Date.now()}`,
    createdAt: now,
    author: body.author || ctx.actor.uid,

    description: body.description,
    scope,
    risk,

    expectedOutcome: body.expectedOutcome || "",
    rollbackPlan: body.rollbackPlan || "",

    status: "declared",
  };

  const repoRoot = getRepoRoot();
  const rec = await appendIntentLedger(repoRoot, "intent.declared", intent);

  return res.status(200).json({
    ok: true,
    intentId: intent.id,
    normalizedIntent: intent,
    trace: { intentHash: rec.hash },
    nextStep: "simulation",
  });
}
