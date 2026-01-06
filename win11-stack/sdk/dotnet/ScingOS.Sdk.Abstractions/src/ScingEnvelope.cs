namespace ScingOS.Sdk.Abstractions;

public sealed record ScingEnvelope<TPayload>(
  string Version,
  string Timestamp,
  string CorrelationId,
  string Source,
  string Type,
  TPayload Payload,
  string? Signature = null
);
