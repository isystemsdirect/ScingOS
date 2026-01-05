export type DevkitClientOptions = {
  baseUrl: string; // e.g. http://localhost:3000
  token: string;
};

export class DevkitClient {
  constructor(private opt: DevkitClientOptions) {}

  private async post(path: string, body: any) {
    const res = await fetch(this.opt.baseUrl + path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dev-kernel-token": this.opt.token,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "DevKernel error");
    return data;
  }

  runTask(task: "typecheck" | "lint" | "build" | "test") {
    return this.post("/api/dev/tasks/run", { task });
  }

  upsertEngine(engine: {
    id: string;
    displayName: string;
    family: string;
    version: string;
    provider?: string;
    entry?: string;
    visualChannel?: string;
  }) {
    return this.post("/api/dev/registry/upsert", engine);
  }
}
