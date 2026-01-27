# COMMAND CENTRAL LOCK — Gemini 3.0 Pro Preview (FBS)

## Authority
- Command Central: ChatGPT (SCINGULAR AIOS Architecture Project)
- Executor: Gemini 3.0 Pro Preview inside Firebase Studio (FBS)

## Role Boundaries (Non-Negotiable)
- Gemini may NOT:
  - restructure folders, rename roots, or move projects
  - introduce new frameworks, rewrite architecture, or change UI intent
  - change repo remotes or push to unknown repos
  - run destructive operations without explicit Command Central approval
- Gemini MAY:
  - apply targeted dependency upgrades explicitly requested
  - fix build/preview breakages caused by upgrades
  - update configs strictly required for Next compatibility
  - produce a clean install + clean build + working preview

## Stability Definition (Baseline)
1) `npm install` succeeds with zero dependency-tree failure
2) `npm run build` succeeds
3) `npm run dev` runs
4) Firebase Studio preview renders expected routes

## Change Discipline
- Every meaningful change must be:
  - visible via `git diff`
  - attributable via a single commit message that states intent
  - pushed to a named branch (never straight to main unless ordered)

