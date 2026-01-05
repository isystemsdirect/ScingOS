export function getRepoRoot(): string {
  // In Next.js API routes, cwd is typically the repo root during local dev.
  return process.cwd();
}
