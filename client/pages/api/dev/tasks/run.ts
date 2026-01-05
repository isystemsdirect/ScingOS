import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import { appendAudit } from "../_lib/audit";
import { getRepoRoot, truncate } from "../_lib/devKernel";
import { requireCapability, requireDevKernel } from "../_lib/requireDevKernel";
import { Capabilities } from "@scingular/policy";

type Body = { task?: "typecheck" | "lint" | "build" | "test" };

const ALLOWED: Record<NonNullable<Body["task"]>, { args: string[]; timeoutMs: number }> = {
  typecheck: { args: ["--prefix", "client", "run", "type-check"], timeoutMs: 2 * 60_000 },
  lint: { args: ["--prefix", "client", "run", "lint"], timeoutMs: 2 * 60_000 },
  build: { args: ["--prefix", "client", "run", "build"], timeoutMs: 5 * 60_000 },
  test: { args: ["--prefix", "client", "run", "test"], timeoutMs: 5 * 60_000 },
};

function npmBin() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function runCmd(args: string[], timeoutMs: number) {
  return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(npmBin(), args, {
      cwd: getRepoRoot(),
      shell: false,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {
        // best-effort
      }
    }, timeoutMs);

    child.stdout?.on("data", (d) => (stdout += d.toString()));
    child.stderr?.on("data", (d) => (stderr += d.toString()));

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: typeof code === "number" ? code : 1, stdout, stderr });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;
  if (!requireCapability(res, ctx, Capabilities.RUN_TASKS)) return;

  const body = (req.body || {}) as Body;
  const spec = body.task ? ALLOWED[body.task] : null;
  if (!spec) return res.status(400).json({ ok: false, error: "Invalid task" });

  const startedAt = Date.now();
  const result = await runCmd(spec.args, spec.timeoutMs);
  const durationMs = Date.now() - startedAt;

  const ok = result.exitCode === 0;

  await appendAudit({
    ts: new Date().toISOString(),
    action: "tasks.run",
    ok,
    actor: { uid: ctx.actor.uid },
    meta: { task: body.task, exitCode: result.exitCode, durationMs },
  });

  return res.status(ok ? 200 : 500).json({
    ok,
    task: body.task,
    exitCode: result.exitCode,
    durationMs,
    stdout: truncate(result.stdout),
    stderr: truncate(result.stderr),
  });
}
