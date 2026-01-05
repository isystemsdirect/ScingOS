import type { NextApiRequest, NextApiResponse } from "next";

export function getRepoRoot(): string {
  // In Next.js API routes, cwd is typically the repo root during local dev.
  return process.cwd();
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(404).json({ ok: false, error: "Not found" });
}
