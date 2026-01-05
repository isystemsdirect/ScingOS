import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { requireDevKernel } from "../../../../lib/server/dev/requireDevKernel";
import { getRepoRoot } from "../../../../lib/server/dev/devKernel";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { enforceDelegation } from "../../../../lib/server/scing/delegation/enforceDelegation";
import { getState, appendAudit } from "../../../../lib/server/scing/store/coAwarenessStore";

const ReqSchema = z
  .object({
    iuPartnerId: z.string().min(1),
    actionPlan: z.any(),
  })
  .strict();

function runCommand(args: { cwd: string; cmd: string; cmdArgs: string[] }) {
  return new Promise<{ code: number | null; out: string }>((resolve) => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: "production" as const,
      SystemRoot: process.env.SystemRoot || process.env.SYSTEMROOT || "C:\\Windows",
      ComSpec: process.env.ComSpec || process.env.COMSPEC || "C:\\Windows\\System32\\cmd.exe",
    };
    const p = spawn(args.cmd, args.cmdArgs, {
      cwd: args.cwd,
      shell: false,
      env,
      stdio: "pipe",
    }) as ChildProcessWithoutNullStreams;
    let out = "";
    p.stdout.on("data", (d: Buffer) => (out += d.toString()));
    p.stderr.on("data", (d: Buffer) => (out += d.toString()));
    p.on("close", (code: number | null) => resolve({ code, out }));
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;

  const parsed = ReqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const { iuPartnerId, actionPlan } = parsed.data;
  const state = getState(iuPartnerId);

  const enforced = enforceDelegation(state, state.delegation.scope, actionPlan, {
    pathsTouched: actionPlan?.predictedImpact?.affectedFiles ?? [],
  });

  if (enforced.decision !== "auto_execute") {
    appendAudit(iuPartnerId, {
      type: "actions.execute.blocked",
      actor: ctx.actor,
      enforced,
      actionPlan: { id: actionPlan?.id, kind: actionPlan?.kind, risk: actionPlan?.risk },
    });
    return res.status(200).json({ ok: false, decision: enforced.decision, reason: enforced.reason });
  }

  if (actionPlan?.kind !== "run_task") {
    appendAudit(iuPartnerId, {
      type: "actions.execute.not_enabled",
      actor: ctx.actor,
      actionPlan: { id: actionPlan?.id, kind: actionPlan?.kind, risk: actionPlan?.risk },
    });
    return res.status(200).json({ ok: false, error: "Execution for this kind not enabled yet; proposal-only" });
  }

  const cwd = getRepoRoot();
  const maxOut = 20000;
  const outputs: { cmd: string; code: number | null; out: string }[] = [];

  const tc = await runCommand({
    cwd,
    cmd: "cmd.exe",
    cmdArgs: ["/c", "npm.cmd --prefix .\\client run type-check -- --pretty false"],
  });
  outputs.push({ cmd: "npm.cmd --prefix .\\client run type-check", code: tc.code, out: tc.out.slice(-maxOut) });

  const build = await runCommand({
    cwd,
    cmd: "cmd.exe",
    cmdArgs: ["/c", "npm.cmd --prefix .\\client run build"],
  });
  outputs.push({ cmd: "npm.cmd --prefix .\\client run build", code: build.code, out: build.out.slice(-maxOut) });

  const ok = outputs.every((o) => o.code === 0);

  appendAudit(iuPartnerId, {
    type: "actions.execute.run_task",
    actor: ctx.actor,
    ok,
    enforced,
    actionPlan: { id: actionPlan?.id, kind: actionPlan?.kind, risk: actionPlan?.risk, decisionWhy: actionPlan?.decisionWhy },
    outputs: outputs.map((o) => ({ cmd: o.cmd, code: o.code })),
  });

  return res.status(200).json({ ok, outputs });
}
