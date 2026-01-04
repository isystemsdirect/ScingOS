import type { NextApiRequest, NextApiResponse } from 'next';
import { baneHttpGuard } from '@scing/bane/server/baneGuards';

type ChatRequest = { correlationId: string; text: string };

type ChatResponse = { textOut: string };

type ErrorResponse = { ok: false; message: string; traceId?: string };

function safeJson(res: NextApiResponse, status: number, body: any) {
  res.status(status).json(body);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatResponse | ErrorResponse>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-bane-identity, x-bane-capabilities');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    safeJson(res, 405, { ok: false, message: 'Method not allowed.' });
    return;
  }

  const host = typeof req.headers.host === 'string' ? req.headers.host : 'localhost';
  const path = req.url ? new URL(req.url, `http://${host}`).pathname : '/api/scing/chat';
  const identityId = typeof req.headers['x-bane-identity'] === 'string' ? req.headers['x-bane-identity'] : undefined;
  const capsHeader = typeof req.headers['x-bane-capabilities'] === 'string' ? req.headers['x-bane-capabilities'] : '';
  const capabilities = capsHeader
    ? capsHeader
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const bodyText = typeof req.body?.text === 'string' ? req.body.text : '';

  const decision = baneHttpGuard({
    path,
    bodyText,
    identityId,
    capabilities,
    sessionIntegrity: identityId
      ? { nonceOk: true, signatureOk: true, tokenFresh: true }
      : { nonceOk: false, signatureOk: false, tokenFresh: false },
  });

  if (!decision.ok) {
    res.setHeader('x-bane-trace-id', decision.traceId);
    if (decision.retryAfterMs) res.setHeader('retry-after', String(Math.ceil(decision.retryAfterMs / 1000)));
    safeJson(res, decision.status, { ok: false, message: decision.message, traceId: decision.traceId });
    return;
  }

  res.setHeader('x-bane-trace-id', decision.traceId);

  const body = (req.body ?? null) as ChatRequest | null;
  const correlationId = typeof body?.correlationId === 'string' ? body.correlationId : '';
  const text = typeof body?.text === 'string' ? body.text.trim() : '';

  if (!correlationId || !text) {
    safeJson(res, 400, { ok: false, message: 'Invalid payload.' });
    return;
  }

  // MVP: deterministic server response (no external dependencies).
  // Future: wire into full SCING ingress when available.
  const textOut = `Understood. ${text}`;

  safeJson(res, 200, { textOut });
}
