import { SENSOR_REGISTRY } from '../../sensors/sensorRegistry';

export function domainAppendixBlock(params: {
  domain: any;
  sensorCaptures?: { providerId: string; captureId: string }[];
}) {
  const providerIds = (params.sensorCaptures ?? []).map((s) => s.providerId);
  providerIds.sort();
  const uniqIds = providerIds.filter((id, idx) => id !== providerIds[idx - 1]);

  const byId = new Map<string, (typeof SENSOR_REGISTRY)[keyof typeof SENSOR_REGISTRY]>();
  for (const p of Object.values(SENSOR_REGISTRY)) byId.set(p.info().providerId, p);

  const sensorProvidersUsed = uniqIds
    .map((providerId) => {
      const p = byId.get(providerId);
      return p ? p.info() : null;
    })
    .filter(Boolean);

  return {
    section: 'domain_pack',
    title: `Domain Pack: ${params.domain.title} (v${params.domain.version})`,
    content: {
      requiredArtifacts: params.domain.requiredArtifacts,
      requiredMeasurements: params.domain.requiredMeasurements,
      taxonomy: params.domain.taxonomy,
      disclaimers: params.domain.reportRequirements,
      sensorProvidersUsed,
    },
  };
}
