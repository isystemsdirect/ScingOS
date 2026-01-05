import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import type { BFIIntent } from "@scingular/bfi-intent";
import type { SimulationOutput } from "./simulator";
import { getBfiDir } from "./intentLedger";

export type SimulationRecord = {
  ts: string;
  intentId: string;
  simulationHash: string;
  output: SimulationOutput;
};

function sha256Json(value: any): string {
  const h = createHash("sha256");
  h.update(JSON.stringify(value));
  return h.digest("hex");
}

export async function persistSimulation(repoRoot: string, intent: BFIIntent, output: SimulationOutput) {
  const dir = await getBfiDir(repoRoot);
  const simsDir = path.join(dir, "simulations");
  await fs.mkdir(simsDir, { recursive: true });

  const ts = new Date().toISOString();
  const simulationHash = sha256Json({ intent, output }).slice(0, 16);

  const rec: SimulationRecord = { ts, intentId: intent.id, simulationHash, output };

  await fs.writeFile(path.join(simsDir, `${intent.id}.json`), JSON.stringify(rec, null, 2) + "\n", "utf8");
  await fs.appendFile(path.join(dir, "simulation-ledger.jsonl"), JSON.stringify(rec) + "\n", "utf8");

  return rec;
}

export async function loadSimulation(repoRoot: string, intentId: string): Promise<SimulationRecord | null> {
  try {
    const dir = await getBfiDir(repoRoot);
    const p = path.join(dir, "simulations", `${intentId}.json`);
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as SimulationRecord;
  } catch {
    return null;
  }
}
