# QUALITY_GATES (Local + CI Parity)

This repo’s CI runs three separate gates:

- Root gate (format + scing quality + client build)
- Client gate (lint + type-check + tests)
- Cloud Functions gate (lint + build + tests)

## CI reference

See:
- `.github/workflows/ci.yml`
- `.github/workflows/scing-quality.yml`

CI uses Node 20.

## Root gate (repo root)

CI steps:

1) Install
- `npm ci`

2) Formatting
- `npm run format:check`

3) SCING quality bundle
- `npm run quality:scing`
  - `npm run typecheck:scing`
  - `npm run lint:scing`
  - `npm run canon:scan`
  - `npm run format:check`

4) Build
- `npm run build`
  - delegates to `npm --prefix client run build`

Expected outcome:
- No lint errors (warnings are allowed unless `--max-warnings=0` is used)
- Prettier check passes
- TypeScript checks pass
- Client build completes

## Client gate (client/)

From repo root:

1) Install
- `npm ci --prefix client`

2) Lint
- `npm run lint --prefix client`

3) Type check
- `npm run type-check --prefix client`

4) Tests
- `npm test --prefix client -- --coverage`

Expected outcome:
- Lint must exit 0 (warnings are acceptable)
- `tsc --noEmit` must pass
- Jest must pass

## Functions gate (cloud/functions/)

From repo root:

1) Install
- `npm ci --prefix cloud/functions`

2) Lint
- `npm run lint --prefix cloud/functions`

3) Build
- `npm run build --prefix cloud/functions`

4) Tests
- `npm test --prefix cloud/functions`

Expected outcome:
- Lint must exit 0
- `tsc` build must pass
- Jest must pass

## Troubleshooting

### `npm ci` fails with EBADENGINE

This repo enforces engines strictly via `.npmrc`:

- `engine-strict=true`

If you are running Node outside the supported range declared in `package.json` engines (root), `npm ci` will hard-fail.

Fix:
- Use Node 20 for CI-parity.

### Client build fails after switching Next versions

If you previously built under a different Next.js version, remove `client/.next` and rebuild:

- `Remove-Item -Recurse -Force client/.next` (PowerShell)
- then rerun `npm --prefix client run build`

### Next.js errors when importing TypeScript outside client/

If the client imports TS from `../scing` (or other external directories), Next.js may fail unless external directories are enabled and the imports are resolvable.

Recommended minimal approach in this repo:
- Enable `experimental.externalDir: true`
- Use a webpack alias (e.g. `@scing`) + TS `paths` mapping
- Avoid deep relative imports like `../../../scing/...`
