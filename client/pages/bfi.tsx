import { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import { CREATOR_STAMP } from "../lib/shared/provenance/creatorStamp";

function useOrigin() {
  return useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);
}

async function postJson(path: string, token: string, body: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-bdk-token": token,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({ ok: false, error: "Invalid JSON response" }));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export default function BfiPage() {
  const origin = useOrigin();

  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const [description, setDescription] = useState("");
  const [intentId, setIntentId] = useState("");
  const [confirmHighRisk, setConfirmHighRisk] = useState(false);

  const [declareOut, setDeclareOut] = useState<any>(null);
  const [simOut, setSimOut] = useState<any>(null);
  const [policyOut, setPolicyOut] = useState<any>(null);
  const [execOut, setExecOut] = useState<any>(null);
  const [healthOut, setHealthOut] = useState<any>(null);
  const [insightsOut, setInsightsOut] = useState<any>(null);

  const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA || "unknown";
  const buildBranch = process.env.NEXT_PUBLIC_BUILD_BRANCH || "unknown";
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || "unknown";

  async function declareIntent() {
    setBusy(true);
    setDeclareOut(null);
    setSimOut(null);
    setPolicyOut(null);
    setExecOut(null);

    try {
      const data = await postJson("/api/bfi/intent/declare", token, { description });
      setDeclareOut(data);
      setIntentId(data.intentId);
    } catch (e: any) {
      setDeclareOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function simulate() {
    setBusy(true);
    setSimOut(null);
    setPolicyOut(null);
    setExecOut(null);
    setHealthOut(null);
    setInsightsOut(null);

    try {
      const data = await postJson("/api/bfi/simulate", token, { intentId });
      setSimOut(data);
    } catch (e: any) {
      setSimOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function evaluatePolicy() {
    setBusy(true);
    setPolicyOut(null);
    setExecOut(null);
    setHealthOut(null);
    setInsightsOut(null);

    try {
      const data = await postJson("/api/bfi/policy/evaluate", token, { intentId });
      setPolicyOut(data);
    } catch (e: any) {
      setPolicyOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function execute() {
    setBusy(true);
    setExecOut(null);

    try {
      const data = await postJson("/api/bfi/execute", token, { intentId, confirmHighRisk });
      setExecOut(data);
    } catch (e: any) {
      setExecOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function loadRegistryHealth() {
    setBusy(true);
    setHealthOut(null);
    try {
      const data = await postJson("/api/bfi/registry/health", token, {});
      setHealthOut(data);
    } catch (e: any) {
      setHealthOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function loadInsights() {
    setBusy(true);
    setInsightsOut(null);
    try {
      const data = await postJson("/api/bfi/insights", token, {});
      setInsightsOut(data);
    } catch (e: any) {
      setInsightsOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="BFI" subtitle={`Category Proof Console. Base: ${origin || "(server)"}`}> 
      <div className="space-y-10">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Authentication</h2>
          <p className="mt-1 text-sm text-gray-600">Requires <span className="font-mono">BDK_TOKEN</span>. Disabled in production.</p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">BDK Token</label>
            <input
              className="mt-1 w-full max-w-xl rounded-lg border border-gray-300 px-3 py-2 text-sm"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="BDK_TOKEN"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Intent</h2>
          <p className="mt-1 text-sm text-gray-600">Flow: declare → simulate → policy → execute (atomic commit).</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='e.g. "Add anomaly correlation engine scaffold and register it"'
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={busy || !description.trim()}
              onClick={declareIntent}
            >
              Declare
            </button>

            <div className="text-sm text-gray-700">
              intentId: <span className="font-mono">{intentId || "(none)"}</span>
            </div>
          </div>

          {declareOut && (
            <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs">{JSON.stringify(declareOut, null, 2)}</pre>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Simulation</h2>
          <div className="mt-4">
            <button
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={busy || !intentId}
              onClick={simulate}
            >
              Simulate
            </button>
          </div>
          {simOut && (
            <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs">{JSON.stringify(simOut, null, 2)}</pre>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Impact Map</h2>
          <p className="mt-1 text-sm text-gray-600">Explainable blast radius derived from the system graph.</p>

          {!simOut?.ok ? (
            <p className="mt-4 text-sm text-gray-600">Run Simulation to populate the impact map.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="text-lg font-semibold text-gray-900">{(simOut.confidenceScore ?? 0).toFixed(2)}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Files</div>
                  <div className="text-lg font-semibold text-gray-900">{(simOut.affectedFiles || []).length}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Engines</div>
                  <div className="text-lg font-semibold text-gray-900">{(simOut.affectedEngines || []).length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">Affected files</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {(simOut.affectedFiles || []).slice(0, 12).map((f: string) => (
                      <li key={f} className="font-mono text-xs">{f}</li>
                    ))}
                  </ul>
                  {(simOut.affectedFiles || []).length > 12 && (
                    <div className="mt-2 text-xs text-gray-600">+{(simOut.affectedFiles || []).length - 12} more</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Affected engines / policies</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {(simOut.affectedEngines || []).slice(0, 8).map((e: string) => (
                      <li key={e} className="font-mono text-xs">engine:{e}</li>
                    ))}
                    {(simOut.affectedPolicies || []).slice(0, 8).map((p: string) => (
                      <li key={p} className="font-mono text-xs">policy:{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {simOut.explanation && (
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="text-sm font-medium text-gray-900">Why this impact?</div>
                  <div className="mt-1 text-xs text-gray-700">
                    Graph scanned {simOut.explanation.graph?.fileCount ?? "?"} files (commit {simOut.explanation.graph?.commit?.slice(0, 7) || "n/a"}).
                  </div>
                  <div className="mt-2 text-xs text-gray-700">
                    Classification: direct {simOut.explanation.classificationSummary?.direct ?? 0}, indirect {simOut.explanation.classificationSummary?.indirect ?? 0}, unknown {simOut.explanation.classificationSummary?.unknown ?? 0}.
                  </div>
                  <div className="mt-2 text-xs text-gray-700">
                    Confidence breakdown: coverage {Number(simOut.explanation.confidenceBreakdown?.graphCoverage ?? 0).toFixed(2)}, history {Number(simOut.explanation.confidenceBreakdown?.historical ?? 0).toFixed(2)}, unknown penalty {Number(simOut.explanation.confidenceBreakdown?.unknownPenalty ?? 0).toFixed(2)}.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Policy</h2>
          <div className="mt-4">
            <button
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={busy || !intentId}
              onClick={evaluatePolicy}
            >
              Evaluate
            </button>
          </div>
          {policyOut && (
            <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs">{JSON.stringify(policyOut, null, 2)}</pre>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Execution</h2>
          <p className="mt-1 text-sm text-gray-600">Creates engine scaffold + registry entry, then commits with required BFI message fields.</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={confirmHighRisk}
                onChange={(e) => setConfirmHighRisk(e.target.checked)}
              />
              Confirm high-risk execution
            </label>

            <button
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={busy || !intentId}
              onClick={execute}
            >
              Execute
            </button>
          </div>

          {execOut && (
            <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs">{JSON.stringify(execOut, null, 2)}</pre>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Registry Health</h2>
          <p className="mt-1 text-sm text-gray-600">Self-aware engine registry analysis (unused, orphaned, missing deps, overlap).</p>

          <div className="mt-4">
            <button
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={busy}
              onClick={loadRegistryHealth}
            >
              Analyze
            </button>
          </div>

          {healthOut && (
            <div className="mt-4 space-y-3">
              {healthOut.ok ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Health score</div>
                  <div className="text-lg font-semibold text-gray-900">{Number(healthOut.healthScore ?? 0).toFixed(2)}</div>
                </div>
              ) : null}

              {healthOut.ok && Array.isArray(healthOut.items) && healthOut.items.length ? (
                <div className="space-y-3">
                  {healthOut.items.map((it: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="text-sm font-semibold text-gray-900">{it.what}</div>
                      <div className="mt-1 text-sm text-gray-700">{it.why}</div>
                      <div className="mt-2 text-xs text-gray-600">Confidence: {Number(it.confidence ?? 0).toFixed(2)}</div>
                      <div className="mt-2 text-sm text-gray-900">Suggested action: <span className="text-gray-700">{it.suggestedAction}</span></div>
                    </div>
                  ))}
                </div>
              ) : null}

              <pre className="max-h-72 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs">{JSON.stringify(healthOut, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">BFI Insights</h2>
          <p className="mt-1 text-sm text-gray-600">Learning loop: what fails, why, and what to do next.</p>

          <div className="mt-4">
            <button
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={busy}
              onClick={loadInsights}
            >
              Generate
            </button>
          </div>

          {insightsOut && insightsOut.ok && Array.isArray(insightsOut.insights) ? (
            <div className="mt-4 space-y-3">
              {insightsOut.insights.map((i: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="text-sm font-semibold text-gray-900">{i.what}</div>
                  <div className="mt-1 text-sm text-gray-700">{i.why}</div>
                  <div className="mt-2 text-xs text-gray-600">Confidence: {Number(i.confidence ?? 0).toFixed(2)}</div>
                  <div className="mt-2 text-sm text-gray-900">Suggested action: <span className="text-gray-700">{i.suggestedAction}</span></div>
                </div>
              ))}
            </div>
          ) : insightsOut ? (
            <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs">{JSON.stringify(insightsOut, null, 2)}</pre>
          ) : null}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">About / Provenance</h2>
          <p className="mt-1 text-sm text-gray-600">Deterministic creator stamp + build metadata.</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Creator</div>
              <div className="text-sm font-semibold text-gray-900">{CREATOR_STAMP.creatorName}</div>
              <div className="mt-1 text-xs text-gray-700">
                {CREATOR_STAMP.product} / {CREATOR_STAMP.system}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Copyright Holder</div>
              <div className="text-sm font-semibold text-gray-900">{CREATOR_STAMP.copyrightHolder}</div>
              <div className="mt-1 text-xs text-gray-700">{CREATOR_STAMP.statement}</div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
            <div className="text-sm font-medium text-gray-900">Build</div>
            <div className="mt-1 text-xs text-gray-700 font-mono">sha: {buildSha}</div>
            <div className="mt-1 text-xs text-gray-700 font-mono">branch: {buildBranch}</div>
            <div className="mt-1 text-xs text-gray-700 font-mono">time: {buildTime}</div>

            <div className="mt-3 text-xs text-gray-600">
              APIs: <span className="font-mono">/api/meta/creator</span>, <span className="font-mono">/api/meta/provenance</span>, <span className="font-mono">/api/meta/build</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
