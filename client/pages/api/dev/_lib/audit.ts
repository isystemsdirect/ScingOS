import * as fs from "fs/promises";
import * as path from "path";
import { getRepoRoot } from "./devKernel";

export type AuditEvent = {
  ts: string;
  action: string;
  ok: boolean;
  actor?: { uid?: string | null };
  meta?: Record<string, any>;
};

export async function appendAudit(evt: AuditEvent): Promise<void> {
  const repoRoot = getRepoRoot();
  const dir = path.join(repoRoot, ".scingular");
  const file = path.join(dir, "devkernel-audit.jsonl");

  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(file, JSON.stringify(evt) + "\n", "utf8");
}
