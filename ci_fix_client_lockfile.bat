@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM SCINGOS - CI Fix: Client Test & Lint (pull_request)
REM Purpose: Generate client/package-lock.json safely and push a PR branch
REM Runs: from repo root (where .git exists)
REM ============================================================

set BRANCH=chore/add-client-lockfile
set COMMIT_MSG=chore_client: add package-lock.json for CI

echo.
echo ============================================================
echo CI FIX - CLIENT LOCKFILE
echo Branch: %BRANCH%
echo ============================================================
echo.

REM ---- Preflight: must be in a git repo root (or any folder within)
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] This folder is not a Git repository. Run this from your repo folder in VS Code.
  exit /b 1
)

REM ---- Ensure we are at repo root for consistent paths
for /f "delims=" %%G in ('git rev-parse --show-toplevel') do set ROOT=%%G
cd /d "%ROOT%"

REM ---- Validate client folder exists
if not exist "client" (
  echo [ERROR] Missing client folder. Expected "%ROOT%\client"
  exit /b 1
)

REM ---- Tool checks
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] node not found. Install Node.js (LTS recommended) and reopen VS Code.
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Ensure Node.js includes npm.
  exit /b 1
)

echo [INFO] Repo root: %ROOT%
echo [INFO] Checking out branch: %BRANCH%

REM ---- If branch exists locally, switch; else create it
git show-ref --verify --quiet refs/heads/%BRANCH%
if errorlevel 1 (
  git switch -c %BRANCH%
  if errorlevel 1 (
    echo [ERROR] Failed to create branch %BRANCH%
    exit /b 1
  )
) else (
  git switch %BRANCH%
  if errorlevel 1 (
    echo [ERROR] Failed to switch to branch %BRANCH%
    exit /b 1
  )
)

REM ---- Generate lockfile only (no node_modules)
echo.
echo [INFO] Generating client/package-lock.json (no node_modules)...
pushd "client" >nul
call npm install --package-lock-only
if errorlevel 1 (
  popd >nul
  echo [ERROR] npm failed while generating package-lock.json
  exit /b 1
)
popd >nul

REM ---- Confirm lockfile exists
if not exist "client\package-lock.json" (
  echo [ERROR] package-lock.json was not created at client\package-lock.json
  exit /b 1
)

REM ---- Stage + commit (only the lockfile)
echo.
echo [INFO] Staging lockfile...
git add "client/package-lock.json"
if errorlevel 1 (
  echo [ERROR] Failed to stage client/package-lock.json
  exit /b 1
)

REM ---- If nothing to commit, exit cleanly
git diff --cached --quiet
if not errorlevel 1 (
  echo [INFO] No changes staged (lockfile already present/identical). Nothing to commit.
  echo [INFO] You can still push the branch if needed:
  echo        git push -u origin %BRANCH%
  exit /b 0
)

echo [INFO] Committing...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo [ERROR] Commit failed.
  exit /b 1
)

REM ---- Push branch
echo.
echo [INFO] Pushing branch to origin...
git push -u origin %BRANCH%
if errorlevel 1 (
  echo [ERROR] Push failed. Check your git remote/auth.
  exit /b 1
)

REM ---- Next steps
echo.
echo ============================================================
echo DONE.
echo Next:
echo 1) Open GitHub and create a PR from %BRANCH% -> main
echo 2) After merge, re-run CI and confirm:
echo    - Client - Test ^& Lint no longer fails at ~10s
echo ============================================================
echo.
exit /b 0
