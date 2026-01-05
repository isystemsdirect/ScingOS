import type { NextApiRequest, NextApiResponse } from "next";
import { requireDevKernel } from "../../dev/_lib/requireDevKernel";
import { getRepoRoot } from "../../dev/_lib/devKernel";
import { analyzeRegistry } from "../../../../lib/server/bfi/registry/registryAnalyzer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const repoRoot = getRepoRoot();
  const out = await analyzeRegistry(repoRoot);

  return res.status(200).json({ ok: true, ...out });
}
