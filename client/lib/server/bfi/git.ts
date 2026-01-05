import { spawn } from "child_process";

export async function runGit(repoRoot: string, args: string[]) {
  return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn("git", args, { cwd: repoRoot, shell: false, env: process.env });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += d.toString()));
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => resolve({ exitCode: typeof code === "number" ? code : 1, stdout, stderr }));
  });
}
