# ScingR Naming (Phase 5)

## Canon

- **ScingOS** is the master project and canonical source of contracts, SDKs, tooling, and governance.
- **ScingR** (pronounced **“singer”**) is the **Windows runtime spawn**: the local runtime/service + shell/UI used for demos and development.
- ScingR is **Powered by ScingOS**.

## What changes now (Phase 5)

- Public-facing strings in the Win11 runtime stack use **ScingR**.
- UI wording uses **Runtime** instead of **Emulator** (except where the legacy internal namespace remains `Scing.Emulator.*`).
- CLI command name remains `scingos`, but its output refers to the **ScingR runtime**.

## What does not change yet

- Internal namespaces and configuration keys may still use legacy names (e.g., `ScingEmulator:*`) until a later refactor.
- Installer naming and MSI product identity is **Phase 6**.

## Practical mapping

- **Service**: “ScingR Runtime Service” (service name/log prefix)
- **Shell/UI title**: “ScingR”
- **Tagline**: “ScingR — Powered by ScingOS"
