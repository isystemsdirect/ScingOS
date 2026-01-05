import type { NextApiRequest, NextApiResponse } from "next";
import { ActorSchema, Capabilities, decide } from "@scingular/policy";
import {
  getDevKernelToken,
  getRequestToken,
  isDevKernelEnabled,
} from "./devKernel";

export type DevKernelContext = {
  actor: { uid: string; role: "owner" | "dev" | "viewer"; env: "dev" | "stage" | "prod" };
};

export function requireDevKernel(req: NextApiRequest, res: NextApiResponse): DevKernelContext | null {
  if (!isDevKernelEnabled()) {
    res.status(403).json({ ok: false, error: "BDK is disabled in production." });
    return null;
  }

  const expected = getDevKernelToken();
  if (!expected) {
    res.status(500).json({ ok: false, error: "BDK_TOKEN (or DEV_KERNEL_TOKEN) is not configured." });
    return null;
  }

  const got = getRequestToken(req);
  if (!got || got !== expected) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return null;
  }

  const env = (process.env.DEV_KERNEL_ENV as any) || "dev";
  const actorCandidate = { uid: "local", role: "owner", env };
  const parsed = ActorSchema.safeParse(actorCandidate);
  if (!parsed.success) {
    res.status(500).json({ ok: false, error: "Invalid DEV_KERNEL_ENV." });
    return null;
  }

  return { actor: parsed.data };
}

export function requireCapability(
  res: NextApiResponse,
  ctx: DevKernelContext,
  cap: (typeof Capabilities)[keyof typeof Capabilities]
): boolean {
  const d = decide(ctx.actor, cap);
  if (!d.ok) {
    res.status(403).json({ ok: false, error: d.reason || "Forbidden." });
    return false;
  }
  return true;
}
