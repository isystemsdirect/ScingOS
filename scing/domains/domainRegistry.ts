import { MOISTURE_MOLD_DOMAIN_V1 } from './moistureMold/v1/domain';

export const DOMAIN_REGISTRY = {
  moisture_mold: MOISTURE_MOLD_DOMAIN_V1,
} as const;

export function getDomain(domainKey: string) {
  return (DOMAIN_REGISTRY as any)[domainKey] ?? null;
}
