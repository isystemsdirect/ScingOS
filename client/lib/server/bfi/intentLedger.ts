import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import type { BFIIntent } from "@scingular/bfi-intent";

export type IntentLedgerRecord = {
  ts: string;
  kind: "intent.declared" | "intent.updated";
  intent: BFIIntent;
  hash: string;
};

function sha256Json(value: any): string {
  const h = createHash("sha256");
  h.update(JSON.stringify(value));
  return h.digest("hex");
}

export async function getBfiDir(repoRoot: string): Promise<string> {
  const dir = path.join(repoRoot, ".scingular", "bfi");
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeIntentState(repoRoot: string, intent: BFIIntent): Promise<void> {
  const dir = await getBfiDir(repoRoot);
  const intentsDir = path.join(dir, "intents");
  await fs.mkdir(intentsDir, { recursive: true });
  await fs.writeFile(path.join(intentsDir, `${intent.id}.json`), JSON.stringify(intent, null, 2) + "\n", "utf8");
}

export async function loadIntentState(repoRoot: string, intentId: string): Promise<BFIIntent | null> {
  try {
    const dir = await getBfiDir(repoRoot);
    const p = path.join(dir, "intents", `${intentId}.json`);
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as BFIIntent;
  } catch {
    return null;
  }
}

export async function appendIntentLedger(repoRoot: string, kind: IntentLedgerRecord["kind"], intent: BFIIntent) {
  const dir = await getBfiDir(repoRoot);
  const file = path.join(dir, "intent-ledger.jsonl");

  const ts = new Date().toISOString();
  const hash = sha256Json({ kind, intent }).slice(0, 32);
  const rec: IntentLedgerRecord = { ts, kind, intent, hash };

  await fs.appendFile(file, JSON.stringify(rec) + "\n", "utf8");
  await writeIntentState(repoRoot, intent);

  return rec;
}
