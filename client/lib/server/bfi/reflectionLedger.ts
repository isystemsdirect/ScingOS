import * as fs from "fs/promises";
import * as path from "path";
import { getBfiDir } from "./intentLedger";

export type ReflectionRecord = {
  ts: string;
  intentId: string;
  ok: boolean;
  unexpectedEffects: string[];
  notes: string[];
};

export async function persistReflection(repoRoot: string, rec: ReflectionRecord) {
  const dir = await getBfiDir(repoRoot);
  const reflDir = path.join(dir, "reflections");
  await fs.mkdir(reflDir, { recursive: true });

  await fs.writeFile(path.join(reflDir, `${rec.intentId}.json`), JSON.stringify(rec, null, 2) + "\n", "utf8");
  await fs.appendFile(path.join(dir, "reflection-ledger.jsonl"), JSON.stringify(rec) + "\n", "utf8");

  return rec;
}
