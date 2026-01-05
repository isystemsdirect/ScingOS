import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { requireDevKernel } from "../dev/_lib/requireDevKernel";
import { tickMobius } from "../../../lib/server/mobius/mobiusKernel";

const BodySchema = z
  .object({
    iuPartnerId: z.string().min(1),
    intentId: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .strict();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = BodySchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const out = await tickMobius(parsed.data);
  return res.status(200).json(out);
}
