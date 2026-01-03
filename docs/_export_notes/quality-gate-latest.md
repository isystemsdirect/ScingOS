# ScingOS quality gate run (local transcript)

**Timestamp (local):** 2026-01-03T22:04:25.750Z
**Repo:** C:\Users\maste\SCINGOS_WORK\ScingOS

## Versions

### node --version
- cwd: C:\Users\maste\SCINGOS_WORK\ScingOS
- exit: 0

**output**

```
v24.12.0
```

### npm.cmd --version
- cwd: C:\Users\maste\SCINGOS_WORK\ScingOS
- exit: 0

**output**

```
11.6.2
```

### npm.cmd config get engine-strict
- cwd: C:\Users\maste\SCINGOS_WORK\ScingOS
- exit: 0

**output**

```
true
```

## Git

### git rev-parse --abbrev-ref HEAD
- cwd: C:\Users\maste\SCINGOS_WORK\ScingOS
- exit: 0

**output**

```
main
```

### git rev-parse HEAD
- cwd: C:\Users\maste\SCINGOS_WORK\ScingOS
- exit: 0

**output**

```
be8d3047a81d3b5b7b26934ff6b089a9ea49ff1f
```

### git status --porcelain=v1
- cwd: C:\Users\maste\SCINGOS_WORK\ScingOS
- exit: 0

**output**

```
 M .gitignore
D  ScingOSEnvironment
 M client/lib/bane/cache.ts
 M client/lib/bane/evaluate.ts
 M client/lib/bane/fetchSnapshot.ts
 M client/lib/evidence/capture.ts
 M client/lib/evidence/localQueue.ts
 M client/next-env.d.ts
 M client/next.config.js
 M client/package-lock.json
 M client/src/lariBus/LariBusProvider.tsx
 M client/src/lariBus/startBus.ts
 M client/src/scing/ScingProvider.tsx
 M client/tsconfig.json
?? docs/_export_notes/
?? docs/ops/
?? scripts/qualityGateTranscript.js
```

## Root: npm ci

### npm.cmd ci
- cwd: C:\Users\maste\SCINGOS_WORK\ScingOS
- exit: 1

**output**

```
npm error code EBADENGINE
npm error engine Unsupported engine
npm error engine Not compatible with your version of node/npm: undefined
npm error notsup Not compatible with your version of node/npm: undefined
npm error notsup Required: {"node":">=20 <21","npm":">=10"}
npm error notsup Actual:   {"npm":"11.6.2","node":"v24.12.0"}
npm error A complete log of this run can be found in: C:\Users\maste\AppData\Local\npm-cache\_logs\2026-01-03T22_04_27_642Z-debug-0.log
```

> Stopped early: first failing step (run with `--full` to continue).
