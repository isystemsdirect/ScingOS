import ENGINES from '../engineRegistry';
import { callModelWithTools } from '../providers/modelRouter';

const LARI_EDL_ENGINE = ENGINES['lari-edl'];

export type LariEdlMode =
  | 'glossary'
  | 'avatar-schemes'
  | 'ecosystem-links'
  | 'investor-narrative'
  | 'refactor-docs'
  | 'code-hints';

export interface LariEdlTask {
  mode: LariEdlMode;
  input: string;
  context?: {
    filePath?: string;
    repo?: string;
    tenantId?: string;
    userRole?: 'founder' | 'investor' | 'collaborator' | 'internal';
    language?: string;
  };
}

/**
 * LARI-EDL: Sub-engine focused on reasoning over the SCINGULAR Ecosystem Dynamic Library,
 * generating canon-aligned text, code hints, and structural updates.
 */
export async function runLariEdl(task: LariEdlTask): Promise<string> {
  const { mode, input, context } = task;

  const systemPrompt = buildSystemPrompt(mode, context);

  const result = await callModelWithTools({
    engine: LARI_EDL_ENGINE,
    systemPrompt,
    userPrompt: input,
    tools: [],
    stream: false,
  });

  return result.text;
}

function buildSystemPrompt(mode: LariEdlMode, context: LariEdlTask['context']): string {
  const base = [
    'You are LARI-EDL, a sub-engine of the LARI family.',
    'Your domain is the SCINGULAR Ecosystem Dynamic Library:',
    '- Glossary of canonical terms',
    '- Avatar schemes (IonMetal, PrismFlux, SpectraFlame, AeroGlow, etc.)',
    '- Ecosystem Linkage Architecture graphs',
    '- Investor and collaborator facing documentation',
    '',
    'General rules:',
    '- Always preserve SCINGULAR canon and terminology.',
    '- Never invent new product names without explicit instruction.',
    '- Prefer expansion and clarification over abstraction.',
    '- Keep outputs structurally clean and ready to paste into docs or code comments.',
  ].join('\n');

  const modeLine = (() => {
    switch (mode) {
      case 'glossary':
        return 'Mode: GLOSSARY — expand, refine, or align glossary entries with canonical structure.';
      case 'avatar-schemes':
        return 'Mode: AVATAR SCHEMES — describe, compare, and structurally map IonMetal, PrismFlux, SpectraFlame, and AeroGlow variants.';
      case 'ecosystem-links':
        return 'Mode: ECOSYSTEM LINKS — reason about cross-domain linkages (semantic, structural, cognitive, reactive, operational).';
      case 'investor-narrative':
        return 'Mode: INVESTOR NARRATIVE — produce clear, high-impact, investor-ready explanations grounded in the Library.';
      case 'refactor-docs':
        return 'Mode: REFACTOR DOCS — rewrite or extend documentation while preserving canon and technical accuracy.';
      case 'code-hints':
        return 'Mode: CODE HINTS — suggest forward-thinking code structures that integrate with the Ecosystem Dynamic Library.';
      default:
        return 'Mode: GENERAL — assist with any reasoning over the Ecosystem Dynamic Library.';
    }
  })();

  const ctxLines: string[] = [];
  if (context?.filePath) ctxLines.push(`Active file: ${context.filePath}`);
  if (context?.repo) ctxLines.push(`Repository: ${context.repo}`);
  if (context?.tenantId) ctxLines.push(`Tenant: ${context.tenantId}`);
  if (context?.userRole) ctxLines.push(`User role: ${context.userRole}`);
  if (context?.language) ctxLines.push(`Language: ${context.language}`);

  const ctxBlock =
    ctxLines.length > 0 ? ['Context:', ...ctxLines, ''].join('\n') : 'Context: none provided.\n';

  return [base, '', modeLine, '', ctxBlock].join('\n');
}
