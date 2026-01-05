import * as fs from "fs/promises";
import * as path from "path";
import type { BFIIntent } from "@scingular/bfi-intent";
import type { PolicyLedgerRecord } from "../policyLedger";
import type { SimulationRecord } from "../simulationLedger";
import type { ReflectionRecord } from "../reflectionLedger";
import { getBfiDir } from "../intentLedger";

export type ExecutionResult = {
  ok: boolean;
  kind: "git.commit";
  commitStdout?: string;
  commitStderr?: string;
};

export type CognitiveMemoryRecord = {
  ts: string;
  intent: BFIIntent;
  simulation?: SimulationRecord;
  policy?: PolicyLedgerRecord;
  execution?: ExecutionResult;
  reflection?: ReflectionRecord;
};

async function memoryPath(repoRoot: string) {
  const dir = await getBfiDir(repoRoot);
  return path.join(dir, "memory.jsonl");
}

export async function appendCognitiveMemory(repoRoot: string, rec: CognitiveMemoryRecord) {
  const p = await memoryPath(repoRoot);
  await fs.appendFile(p, JSON.stringify(rec) + "\n", "utf8");
  return rec;
}

export async function readCognitiveMemory(repoRoot: string, opts?: { limit?: number }): Promise<CognitiveMemoryRecord[]> {
  try {
    const p = await memoryPath(repoRoot);
    const raw = await fs.readFile(p, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const limit = opts?.limit ?? 200;
    const slice = lines.slice(Math.max(0, lines.length - limit));
    return slice.map((l) => JSON.parse(l) as CognitiveMemoryRecord);
  } catch {
    return [];
  }
}
