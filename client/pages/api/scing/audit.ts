import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { requireDevKernel } from "../dev/_lib/requireDevKernel";
import { readAudit } from "../../../lib/server/scing/store/coAwarenessStore";

const BodySchema = z.object({
  iuPartnerId: z.string().min(1),
  limit: z.number().int().min(1).max(200).optional(),
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = BodySchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const rows = readAudit(parsed.data.iuPartnerId, parsed.data.limit ?? 50);
  return res.status(200).json({ ok: true, audit: rows });
}
