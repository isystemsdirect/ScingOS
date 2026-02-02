# AI Federation Contract (for ScingGPT)

ScingGPT is the router, auditor, and policy gate.
External AIs are providers that return responses + citations.

## Providers (ids)
- perplexity
- openai
- anthropic
- google

## Modes
- single: one provider
- fanout: multiple providers in parallel
- consensus: multi-provider + summarize common ground
- judge: multi-provider + one chosen as judge to pick best
- assemble: multi-provider + structured synthesis into sections

## Governance
- No secrets in packets.
- Deterministic: include prompt, provider model, timestamps, and citations.
- All outputs are written as packets into:
  - .spectroline/ai/outbox
  - optional snapshots into .spectroline/ai/state
