import type { BFIIntent } from "@scingular/bfi-intent";
import { readCognitiveMemory } from "./cognitiveMemory";

export type BfiInsight = {
  what: string;
  why: string;
  confidence: number; // 0-1
  suggestedAction: string;
};

export type MemoryStats = {
  expectedSuccessRate: number;
  sampleSize: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4)
    .slice(0, 12);
}

function jaccardTokens(a: string[], b: string[]) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = Array.from(A).filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

export async function getMemoryStatsForIntent(repoRoot: string, intent: BFIIntent): Promise<MemoryStats | null> {
  const mem = await readCognitiveMemory(repoRoot, { limit: 600 });
  if (!mem.length) return null;

  const intentTokens = tokenize(intent.description);

  const scored = mem
    .map((r) => {
      const tok = tokenize(r.intent.description);
      const sim = jaccardTokens(intentTokens, tok);
      const scopeBonus = r.intent.scope === intent.scope ? 0.25 : 0;
      const riskBonus = r.intent.risk === intent.risk ? 0.1 : 0;
      const score = sim + scopeBonus + riskBonus;
      return { r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .filter((x) => x.score >= 0.15);

  const sample = scored.length ? scored.map((x) => x.r) : mem.slice(-40);

  const total = sample.length;
  const ok = sample.filter((r) => !!r.execution?.ok).length;
  const expectedSuccessRate = ok / Math.max(1, total);

  return {
    expectedSuccessRate: clamp01(expectedSuccessRate),
    sampleSize: total,
  };
}

export async function computeInsights(repoRoot: string) {
  const mem = await readCognitiveMemory(repoRoot, { limit: 400 });

  const insights: BfiInsight[] = [];
  if (mem.length < 3) {
    insights.push({
      what: "Not enough memory yet",
      why: "BFI needs at least a few executed intents to learn success/failure patterns.",
      confidence: 0.6,
      suggestedAction: "Run the Phase 2 demo flow 3–5 times, then re-check insights.",
    });
    return { insights, stats: { samples: mem.length } };
  }

  const byScope = new Map<string, { ok: number; total: number }>();
  const blastByScope = new Map<string, { totalNodes: number; total: number }>();
  const denyCount = { deny: 0, total: 0 };

  const failTokens = new Map<string, number>();

  for (const r of mem) {
    const scope = r.intent.scope;
    const ok = !!r.execution?.ok;

    const prev = byScope.get(scope) || { ok: 0, total: 0 };
    prev.total += 1;
    if (ok) prev.ok += 1;
    byScope.set(scope, prev);

    const affectedNodes = r.simulation?.output?.affectedFiles?.length || 0;
    const blast = blastByScope.get(scope) || { totalNodes: 0, total: 0 };
    blast.total += 1;
    blast.totalNodes += affectedNodes;
    blastByScope.set(scope, blast);

    denyCount.total += 1;
    if (r.policy?.decision?.decision === "deny") denyCount.deny += 1;

    if (!ok) {
      for (const t of tokenize(r.intent.description)) {
        failTokens.set(t, (failTokens.get(t) || 0) + 1);
      }
    }
  }

  // Insights: high blast radius scope
  for (const [scope, v] of blastByScope.entries()) {
    const avg = v.totalNodes / Math.max(1, v.total);
    if (avg >= 3) {
      insights.push({
        what: `Scope '${scope}' tends to touch many files`,
        why: `Average impacted files for this scope is ~${avg.toFixed(1)} in recent runs.`,
        confidence: clamp01(Math.min(0.9, v.total / 10)),
        suggestedAction: "Prefer smaller, staged intents or isolate changes behind flags.",
      });
    }
  }

  // Insights: scopes with low success rate
  for (const [scope, v] of byScope.entries()) {
    const rate = v.ok / Math.max(1, v.total);
    if (v.total >= 3 && rate <= 0.5) {
      insights.push({
        what: `Intents in scope '${scope}' often fail`,
        why: `Success rate is ${(rate * 100).toFixed(0)}% across ${v.total} samples.`,
        confidence: clamp01(0.5 + v.total / 10),
        suggestedAction: "Add a smaller test intent first, or improve simulation coverage before executing.",
      });
    }
  }

  // Insights: policy blocking innovation
  if (denyCount.total >= 5) {
    const denyRate = denyCount.deny / denyCount.total;
    if (denyRate >= 0.4) {
      insights.push({
        what: "Policies are frequently blocking execution",
        why: `Deny rate is ${(denyRate * 100).toFixed(0)}% over ${denyCount.total} decisions.`,
        confidence: clamp01(0.5 + denyCount.total / 20),
        suggestedAction: "Review deny reasons; consider converting some denies to warns with required confirmation.",
      });
    }
  }

  // Insights: frequent failure keywords
  const topFail = Array.from(failTokens.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (topFail.length) {
    insights.push({
      what: `Failure-associated keywords: ${topFail.map(([t]) => t).join(", ")}`,
      why: "These tokens appear often in failed intents. This is a weak heuristic, not causation.",
      confidence: clamp01(0.4 + topFail[0][1] / 10),
      suggestedAction: "When using these intents, demand a higher confidence score or tighter blast radius.",
    });
  }

  if (!insights.length) {
    insights.push({
      what: "No significant patterns detected",
      why: "Recent executions don’t show consistent failures or high-risk scope behavior.",
      confidence: 0.55,
      suggestedAction: "Keep running governed intents to strengthen the dataset.",
    });
  }

  return { insights, stats: { samples: mem.length } };
}
