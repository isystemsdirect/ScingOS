export function domainAppendixBlock(params: { domain: any }) {
  return {
    section: 'domain_pack',
    title: `Domain Pack: ${params.domain.title} (v${params.domain.version})`,
    content: {
      requiredArtifacts: params.domain.requiredArtifacts,
      requiredMeasurements: params.domain.requiredMeasurements,
      taxonomy: params.domain.taxonomy,
      disclaimers: params.domain.reportRequirements,
    },
  };
}
