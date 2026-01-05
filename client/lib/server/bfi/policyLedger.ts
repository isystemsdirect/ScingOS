import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import type { BFIIntent } from "@scingular/bfi-intent";
import type { PolicyDecision } from "@scingular/bfi-policy";
import { getBfiDir } from "./intentLedger";

export type PolicyLedgerRecord = {
  ts: string;
  intentId: string;
  actor: { id: string; role: string; env: string };
  decisionId: string;
  decision: PolicyDecision;
};

function sha256Json(value: any): string {
  const h = createHash("sha256");
  h.update(JSON.stringify(value));
  return h.digest("hex");
}

export async function persistPolicyDecision(repoRoot: string, input: {
  intent: BFIIntent;
  actor: { id: string; role: string; env: string };
  decision: PolicyDecision;
}) {
  const dir = await getBfiDir(repoRoot);
  const decisionsDir = path.join(dir, "decisions");
  await fs.mkdir(decisionsDir, { recursive: true });

  const ts = new Date().toISOString();
  const decisionId = sha256Json({ intentId: input.intent.id, actor: input.actor, decision: input.decision }).slice(0, 16);

  const rec: PolicyLedgerRecord = {
    ts,
    intentId: input.intent.id,
    actor: input.actor,
    decisionId,
    decision: input.decision,
  };

  await fs.writeFile(path.join(decisionsDir, `${input.intent.id}.json`), JSON.stringify(rec, null, 2) + "\n", "utf8");
  await fs.appendFile(path.join(dir, "policy-ledger.jsonl"), JSON.stringify(rec) + "\n", "utf8");

  return rec;
}

export async function loadPolicyDecision(repoRoot: string, intentId: string): Promise<PolicyLedgerRecord | null> {
  try {
    const dir = await getBfiDir(repoRoot);
    const p = path.join(dir, "decisions", `${intentId}.json`);
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as PolicyLedgerRecord;
  } catch {
    return null;
  }
}
