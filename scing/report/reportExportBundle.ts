import type { ExportManifest } from './reportManifest';
import { sha256Hex } from '../evidence/evidenceHash';
import { stableJsonDeep } from './reportDeterminism';

export type ExportBundle = {
  bundleVersion: '1';
  orgId: string;
  inspectionId: string;
  reportId: string;
  createdAt: string;

  manifest: ExportManifest;

  // primary outputs
  reportJson: unknown;
  reportHtml: string;

  // signature (server signs)
  signature?: { alg: 'EdDSA' | 'ES256' | 'RS256'; kid: string; sig: string; signedAt: string };
};

export function renderSimpleHtml(report: unknown): string {
  const esc = (s: unknown) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const r = report as { sections?: Array<{ title?: string; content?: unknown }> };
  const sections = (r.sections ?? [])
    .map((b) => `<h2>${esc(b.title)}</h2><pre>${esc(JSON.stringify(b.content, null, 2))}</pre>`)
    .join('\n');

  const title =
    (r.sections?.[0] as { content?: { title?: string } } | undefined)?.content?.title ??
    'Inspection Report';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(
    title
  )}</title></head><body><h1>${esc(title)}</h1>${sections}</body></html>`;
}

export function bundleHash(bundle: Omit<ExportBundle, 'signature'>): string {
  return sha256Hex(stableJsonDeep(bundle));
}
