import * as functions from 'firebase-functions';

// OPTIONAL: open a GitHub Issue on critical errors.
// Requires functions config:
// - obs.github_repo (e.g. "isystemsdirect/ScingOS")
// - obs.github_token (PAT with repo:issues scope)
// Never commit the token.

export async function maybeNotifyGitHubOnCritical(evt: any) {
  try {
    const repo = (functions.config?.() as any)?.obs?.github_repo;
    const token = (functions.config?.() as any)?.obs?.github_token;
    if (!repo || !token) return { ok: false, skipped: true, reason: 'NO_GITHUB_CONFIG' };
    if (evt?.severity !== 'critical') return { ok: false, skipped: true, reason: 'NOT_CRITICAL' };

    const [owner, name] = String(repo).split('/');
    const title = `[SCINGULAR] Critical: ${evt.scope} — ${String(evt.message).slice(0, 80)}`;
    const body = [
      `Severity: ${evt.severity}`,
      `Scope: ${evt.scope}`,
      `Correlation: ${evt.correlationId}`,
      evt.inspectionId ? `Inspection: ${evt.inspectionId}` : '',
      evt.engineId ? `Engine: ${evt.engineId}` : '',
      evt.phase ? `Phase: ${evt.phase}` : '',
      '',
      'Message:',
      evt.message,
      '',
      'Error:',
      evt.errorName ?? '(none)',
      '',
      'Stack (truncated):',
      (evt.errorStack ?? '').slice(0, 8000),
      '',
      'Meta:',
      '```json',
      JSON.stringify(evt.meta ?? null, null, 2).slice(0, 8000),
      '```',
    ]
      .filter(Boolean)
      .join('\n');

    const res = await fetch(`https://api.github.com/repos/${owner}/${name}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'SCINGULAR-OBS',
      },
      body: JSON.stringify({ title, body, labels: ['obs', 'critical'] }),
    });

    if (!res.ok) return { ok: false, skipped: false, reason: `HTTP_${res.status}` };
    const json = await res.json();
    return { ok: true, issueUrl: json?.html_url ?? null };
  } catch (e: any) {
    return { ok: false, skipped: false, reason: e?.message ?? 'UNKNOWN' };
  }
}
