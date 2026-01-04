import { MOISTURE_MOLD_DOMAIN_V1 } from './moistureMold/v1/domain';
import { ROOFING_DOMAIN_V1 } from './roofing/v1/domain';
import { ELECTRICAL_DOMAIN_V1 } from './electrical/v1/domain';
import { PLUMBING_DOMAIN_V1 } from './plumbing/v1/domain';

export const DOMAIN_REGISTRY = {
  moisture_mold: MOISTURE_MOLD_DOMAIN_V1,
  roofing: ROOFING_DOMAIN_V1,
  electrical: ELECTRICAL_DOMAIN_V1,
  plumbing: PLUMBING_DOMAIN_V1,
} as const;

export type DomainDefinition = (typeof DOMAIN_REGISTRY)[keyof typeof DOMAIN_REGISTRY];

export function getDomain(domainKey: string) {
  return (DOMAIN_REGISTRY as Record<string, DomainDefinition>)[domainKey] ?? null;
}
