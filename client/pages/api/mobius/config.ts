import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { requireDevKernel } from "../dev/_lib/requireDevKernel";
import { loadMobiusConfig, saveMobiusConfig } from "../../../lib/server/mobius/mobiusKernel";

const BodySchema = z
  .object({
    iuPartnerId: z.string().min(1),
    patch: z
      .object({
        enabled: z.boolean().optional(),
        mode: z.enum(["dormant", "manual_tick", "scheduled"]).optional(),
        tickIntervalMs: z.number().int().positive().optional(),
        minConfidenceToAct: z.number().min(0).max(1).optional(),
        maxAutoRisk: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
      .partial()
      .optional(),
  })
  .strict();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = BodySchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const { iuPartnerId, patch } = parsed.data;

  if (!patch) {
    const config = loadMobiusConfig(iuPartnerId);
    return res.status(200).json({ ok: true, config });
  }

  const config = saveMobiusConfig(iuPartnerId, patch);
  return res.status(200).json({ ok: true, config });
}
