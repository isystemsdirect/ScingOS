import { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import type { IntentRisk, IntentScope } from "@scingular/sdk";

type Task = "typecheck" | "lint" | "build" | "test";
type ActionKind = "tasks.run" | "registry.upsert";

function useOrigin() {
  return useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);
}

export default function DevConsolePage() {
  const origin = useOrigin();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionKind, setActionKind] = useState<ActionKind>("tasks.run");
  const [task, setTask] = useState<Task>("typecheck");

  const [intent, setIntent] = useState({
    id: `intent-${Date.now()}`,
    description: "",
    scope: "ui" as IntentScope,
    riskLevel: "low" as IntentRisk,
    expectedOutcome: "",
    rollbackStrategy: "",
  });

  const [engine, setEngine] = useState({
    id: "",
    displayName: "",
    family: "",
    version: "",
    provider: "",
    entry: "",
    visualChannel: "",
    purpose: "",
    cognitiveRole: "",
    dependencies: "",
    failureModes: "",
    policySurface: "",
  });

  const [planOut, setPlanOut] = useState<any>(null);
  const [execOut, setExecOut] = useState<any>(null);

  async function post(path: string, body: any) {
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

  function buildAction() {
    if (actionKind === "tasks.run") {
      return { kind: "tasks.run" as const, task };
    }

    const arr = (s: string) =>
      s
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

    return {
      kind: "registry.upsert" as const,
      engine: {
        id: engine.id,
        displayName: engine.displayName,
        family: engine.family,
        version: engine.version,
        provider: engine.provider || undefined,
        entry: engine.entry || undefined,
        visualChannel: engine.visualChannel || undefined,
        purpose: engine.purpose || undefined,
        cognitiveRole: engine.cognitiveRole || undefined,
        dependencies: engine.dependencies ? arr(engine.dependencies) : undefined,
        failureModes: engine.failureModes ? arr(engine.failureModes) : undefined,
        policySurface: engine.policySurface ? arr(engine.policySurface) : undefined,
      },
    };
  }

  async function simulate() {
    setBusy(true);
    setPlanOut(null);
    setExecOut(null);
    try {
      const data = await post("/api/bfi/plan", { intent, action: buildAction() });
      setPlanOut(data);
    } catch (e: any) {
      setPlanOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function execute() {
    setBusy(true);
    setExecOut(null);
    try {
      const data = await post("/api/bfi/execute", { intent, action: buildAction() });
      setExecOut(data);
    } catch (e: any) {
      setExecOut({ ok: false, error: e?.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Dev Console"
      subtitle={`BFI Intent Console (BDK). Base: ${origin || "(server)"}`}
    >
      <div className="space-y-10">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Authentication</h2>
          <p className="mt-1 text-sm text-gray-600">
            Set <span className="font-mono">BDK_TOKEN</span> (or <span className="font-mono">DEV_KERNEL_TOKEN</span>) and paste it here.
            BDK is disabled in production.
          </p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Dev Kernel Token</label>
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
          <h2 className="text-lg font-semibold text-gray-900">Intent Console</h2>
          <p className="mt-1 text-sm text-gray-600">
            Primary flow: declare intent → simulate impact → evaluate policy → execute → reflect.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">intent.id</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={intent.id}
                onChange={(e) => setIntent((s) => ({ ...s, id: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">intent.scope</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={intent.scope}
                onChange={(e) => setIntent((s) => ({ ...s, scope: e.target.value as any }))}
              >
                <option value="engine">engine</option>
                <option value="registry">registry</option>
                <option value="ui">ui</option>
                <option value="policy">policy</option>
                <option value="infra">infra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">intent.riskLevel</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={intent.riskLevel}
                onChange={(e) => setIntent((s) => ({ ...s, riskLevel: e.target.value as any }))}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">action.kind</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={actionKind}
                onChange={(e) => setActionKind(e.target.value as any)}
              >
                <option value="tasks.run">tasks.run</option>
                <option value="registry.upsert">registry.upsert</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">intent.description</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              value={intent.description}
              onChange={(e) => setIntent((s) => ({ ...s, description: e.target.value }))}
              placeholder='e.g. "Tighten policy around prod mutations"'
            />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">intent.expectedOutcome</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={2}
                value={intent.expectedOutcome}
                onChange={(e) => setIntent((s) => ({ ...s, expectedOutcome: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">intent.rollbackStrategy</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={2}
                value={intent.rollbackStrategy}
                onChange={(e) => setIntent((s) => ({ ...s, rollbackStrategy: e.target.value }))}
              />
            </div>
          </div>

          {actionKind === "tasks.run" ? (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">task</label>
              <select
                className="mt-1 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={task}
                onChange={(e) => setTask(e.target.value as Task)}
              >
                <option value="typecheck">typecheck</option>
                <option value="lint">lint</option>
                <option value="build">build</option>
                <option value="test">test</option>
              </select>
            </div>
          ) : (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">Engine (registry.upsert)</h3>
              <p className="mt-1 text-xs text-gray-600">Writes to scingular.engine-registry.json at repo root.</p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["id", "id"],
                  ["displayName", "displayName"],
                  ["family", "family"],
                  ["version", "version"],
                  ["provider", "provider"],
                  ["entry", "entry"],
                  ["visualChannel", "visualChannel"],
                  ["purpose", "purpose"],
                  ["cognitiveRole", "cognitiveRole"],
                ] as const).map(([k, key]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-gray-700">{k}</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={(engine as any)[key]}
                      onChange={(e) => setEngine((s) => ({ ...s, [key]: e.target.value }))}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700">dependencies (one per line)</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={3}
                    value={engine.dependencies}
                    onChange={(e) => setEngine((s) => ({ ...s, dependencies: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">failureModes (one per line)</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={3}
                    value={engine.failureModes}
                    onChange={(e) => setEngine((s) => ({ ...s, failureModes: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">policySurface (one per line)</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={3}
                    value={engine.policySurface}
                    onChange={(e) => setEngine((s) => ({ ...s, policySurface: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
              type="button"
              onClick={simulate}
              disabled={busy || !token}
            >
              Simulate Impact
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
              type="button"
              onClick={execute}
              disabled={busy || !token}
            >
              Execute
            </button>
          </div>

          {planOut ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900">Impact Simulation</h3>
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-auto text-xs">
                {JSON.stringify(planOut, null, 2)}
              </pre>
            </div>
          ) : null}

          {execOut ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900">Execution + Reflection</h3>
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-auto text-xs">
                {JSON.stringify(execOut, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
