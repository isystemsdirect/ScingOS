import type { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs/promises";
import * as path from "path";
import { z } from "zod";
import { appendAudit } from "../_lib/audit";
import { getRepoRoot } from "../_lib/devKernel";
import { requireCapability, requireDevKernel } from "../_lib/requireDevKernel";
import { Capabilities } from "@scingular/policy";

const EngineSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  family: z.string().min(1),
  version: z.string().min(1),
  provider: z.string().optional(),
  entry: z.string().optional(),
  visualChannel: z.string().optional(),
});

type Engine = z.infer<typeof EngineSchema>;

type RegistryFile = {
  version: 1;
  updatedAt: string;
  engines: Engine[];
};

async function readRegistry(filePath: string): Promise<RegistryFile> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.engines)) throw new Error("bad");
    return parsed as RegistryFile;
  } catch {
    return { version: 1, updatedAt: new Date().toISOString(), engines: [] };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const ctx = requireDevKernel(req, res);
  if (!ctx) return;
  if (!requireCapability(res, ctx, Capabilities.UPDATE_REGISTRY)) return;

  const parsed = EngineSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message });

  const repoRoot = getRepoRoot();
  const filePath = path.join(repoRoot, "scingular.engine-registry.json");

  const registry = await readRegistry(filePath);
  const engine = parsed.data;

  const idx = registry.engines.findIndex((e) => e.id === engine.id);
  if (idx >= 0) registry.engines[idx] = engine;
  else registry.engines.push(engine);

  registry.updatedAt = new Date().toISOString();

  await fs.writeFile(filePath, JSON.stringify(registry, null, 2) + "\n", "utf8");

  await appendAudit({
    ts: new Date().toISOString(),
    action: "registry.upsert",
    ok: true,
    actor: { uid: ctx.actor.uid },
    meta: { id: engine.id },
  });

  return res.status(200).json({ ok: true, registryPath: "scingular.engine-registry.json", engine });
}
