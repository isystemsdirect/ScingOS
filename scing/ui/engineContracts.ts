import type { EngineId } from '../engine/engineTypes';
import { ENGINE_REGISTRY } from '../engine/engineRegistry';
import type { ReportSection } from './reportSchema';
import type { EngineHUDPayload, GuidedWorkflow } from './scingTypes';

export type EngineUIContract = {
  engineId: EngineId;
  displayName: string;
  description?: string;

  supportsHUD: boolean;
  supportsGuidance: boolean;
  supportsReports: boolean;

  hud?: (input: {
    findingsCount: number;
    telemetry?: any;
    warnings?: string[];
  }) => EngineHUDPayload;

  workflow?: () => GuidedWorkflow | null;

  reportSections: ReportSection[]; // identifiers only; SCING resolves content
};

function uniq<T>(arr: T[]): T[] {
  const out: T[] = [];
  for (const v of arr) if (!out.includes(v)) out.push(v);
  return out;
}

function computeReportSections(engineId: EngineId): ReportSection[] {
  const e = ENGINE_REGISTRY[engineId];
  const sections: ReportSection[] = ['overview'];

  if (e.capabilities.includes('capture')) sections.push('imagery');
  if (e.capabilities.includes('map')) sections.push('maps', 'measurements');
  if (e.capabilities.includes('control')) sections.push('flight');
  if (e.capabilities.includes('analyze') || e.capabilities.includes('classify'))
    sections.push('findings');

  sections.push('appendix');
  return uniq(sections);
}

export function getEngineUIContract(engineId: EngineId): EngineUIContract {
  const e = ENGINE_REGISTRY[engineId];

  return {
    engineId,
    displayName: e.title,
    description: e.description,

    supportsHUD: true,
    supportsGuidance: e.capabilities.includes('capture') || e.capabilities.includes('control'),
    supportsReports: true,

    reportSections: computeReportSections(engineId),
  };
}

export function getAllEngineUIContracts(): EngineUIContract[] {
  return (Object.keys(ENGINE_REGISTRY) as EngineId[])
    .slice()
    .sort()
    .map((id) => getEngineUIContract(id));
}
