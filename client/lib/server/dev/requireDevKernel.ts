import type { NextApiRequest, NextApiResponse } from "next";

export type DevKernelContext = {
  actor: string;
};

export function requireDevKernel(req: NextApiRequest, res: NextApiResponse): DevKernelContext | null {
  const token = String(req.headers["x-bdk-token"] ?? "").trim();
  if (!token) {
    res.status(401).json({ ok: false, error: "Missing x-bdk-token" });
    return null;
  }

  // Non-personal identity only.
  return { actor: "bdk" };
}
