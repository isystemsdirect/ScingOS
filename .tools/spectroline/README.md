# SpectroLINE™ Lane Tooling

## Emit a packet (into inbox)
Examples:

Clipboard push:
powershell -ExecutionPolicy Bypass -File .tools\spectroline\spectroline_emit.ps1 \
  -Topic clipboard_push -App spectrocap \
  -PayloadJson '{ "content":"HELLO", "mime":"text/plain", "device":"note20u" }'

Receiver config get:
powershell -ExecutionPolicy Bypass -File .tools\spectroline\spectroline_emit.ps1 \
  -Topic receiver_config_get -App spectrocap \
  -PayloadJson '{ "keys":["receiver_ip","receiver_port"], "device":"note20u" }'

## Watch + ACK (proof-of-life)
powershell -ExecutionPolicy Bypass -File .tools\spectroline\spectroline_watch.ps1

This watcher is intentionally minimal and non-destructive: it only creates ACK packets in outbox.

## Daily Driver (one command)
Spark + Bridge + Watcher + OPS + optional validate/commitpush

powershell -ExecutionPolicy Bypass -File .tools\spectroline\spectroline_daily_driver.ps1

Validate + commitpush:

powershell -ExecutionPolicy Bypass -File .tools\spectroline\spectroline_daily_driver.ps1 -DoValidate -DoCommitPush -CommitMsg "Checkpoint: SpectroLINE daily"
