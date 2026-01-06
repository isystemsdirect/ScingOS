namespace ScingOS.Sdk.Abstractions;

public sealed class ScingCapabilityDeniedException : InvalidOperationException
{
  public string Capability { get; }

  public ScingCapabilityDeniedException(string capability, string message)
    : base(message)
  {
    Capability = capability;
  }
}
