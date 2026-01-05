import type { NextApiRequest } from "next";
import * as path from "path";

export function getRepoRoot(): string {
  const cwd = process.cwd();
  return path.basename(cwd) === "client" ? path.resolve(cwd, "..") : cwd;
}

export function isDevKernelEnabled(): boolean {
  // Safe-by-default: never allow Dev Kernel in production.
  return process.env.NODE_ENV !== "production";
}

export function getDevKernelToken(): string | null {
  const token = process.env.BDK_TOKEN || process.env.DEV_KERNEL_TOKEN;
  return token && token.trim().length > 0 ? token.trim() : null;
}

export function getRequestToken(req: NextApiRequest): string | null {
  const rawA = req.headers["x-bdk-token"];
  const rawB = req.headers["x-dev-kernel-token"];
  const raw = typeof rawA === "string" ? rawA : typeof rawB === "string" ? rawB : null;
  if (!raw) return null;
  const t = raw.trim();
  return t.length ? t : null;
}

export function truncate(s: string, max = 20000): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n... (truncated)";
}
