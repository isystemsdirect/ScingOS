#!/usr/bin/env bash
# File: scingular-vscode-it.sh
# Location: place in your local ScingOS repo root
# Purpose: VS Code It Protocol – sync SCINGULAR Ecosystem Dynamic Library
#          between main repo /docs and GitHub Wiki for isystemsdirect/ScingOS

set -euo pipefail

MAIN_REPO_NAME="ScingOS"
MAIN_REPO_OWNER="isystemsdirect"
MAIN_REPO_GIT="https://github.com/${MAIN_REPO_OWNER}/${MAIN_REPO_NAME}.git"

WIKI_REPO_GIT="https://github.com/${MAIN_REPO_OWNER}/${MAIN_REPO_NAME}.wiki.git"
WIKI_DIR="${MAIN_REPO_NAME}.wiki"

DOCS_FILE_PATH="docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md"
WIKI_FILE_NAME="The-SCINGULAR-Ecosystem-Dynamic-Library.md"

BRANCH_MAIN="main"

if [ ! -d ".git" ]; then
  echo "This script must be run from the root of the ${MAIN_REPO_NAME} git repo."
  exit 1
fi

if [ ! -f "${DOCS_FILE_PATH}" ]; then
  echo "Missing file: ${DOCS_FILE_PATH}"
  exit 1
fi

echo "Syncing main repo..."
git fetch origin
git checkout "${BRANCH_MAIN}"
git pull origin "${BRANCH_MAIN}"

if [ ! -d "../${WIKI_DIR}" ]; then
  echo "Cloning wiki repo..."
  cd ..
  git clone "${WIKI_REPO_GIT}"
  cd "${MAIN_REPO_NAME}"
else
  echo "Wiki repo already exists. Updating..."
  (cd "../${WIKI_DIR}" && git fetch origin && git checkout "${BRANCH_MAIN}" || git checkout -B "${BRANCH_MAIN}" && git pull origin "${BRANCH_MAIN}" || true)
fi

if [ ! -f "../${WIKI_DIR}/${WIKI_FILE_NAME}" ]; then
  echo "Creating wiki file: ${WIKI_FILE_NAME}"
  cp "${DOCS_FILE_PATH}" "../${WIKI_DIR}/${WIKI_FILE_NAME}"
else
  echo "Updating wiki file from docs..."
  cp "${DOCS_FILE_PATH}" "../${WIKI_DIR}/${WIKI_FILE_NAME}"
fi

echo "Staging and committing wiki changes..."
(
  cd "../${WIKI_DIR}"
  git add "${WIKI_FILE_NAME}" || true
  if ! git diff --cached --quiet; then
    git commit -m "Library update: sync SCINGULAR Ecosystem Dynamic Library from main repo"
    git push origin "${BRANCH_MAIN}"
  else
    echo "No wiki changes to commit."
  fi
)

echo "Sync complete."
