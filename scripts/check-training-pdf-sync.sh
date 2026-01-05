#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-origin/main}"

# Ensure base ref exists (best-effort)
git fetch origin main --quiet || true

# Detect changed training markdown files
mapfile -t md_changed < <(git diff --name-only "$BASE"...HEAD -- \
  docs/hr/training/*.md docs/hr/training/*/*.md 2>/dev/null | grep -E '\.md$' || true)

# Ignore README / export notes as triggers (they don't require PDFs)
md_changed=( "${md_changed[@]/docs\/hr\/training\/README.md/}" )
md_changed=( "${md_changed[@]/docs\/hr\/training\/_export_notes\/EXPORT_TO_PDF.md/}" )
md_changed=( "${md_changed[@]}" )
# Remove empty entries
md_changed=( $(printf "%s\n" "${md_changed[@]}" | sed '/^$/d') )

if [[ "${#md_changed[@]}" -eq 0 ]]; then
  echo "[OK] No training Markdown changes detected vs $BASE."
  exit 0
fi

# Detect changed PDFs
mapfile -t pdf_changed < <(git diff --name-only "$BASE"...HEAD -- \
  docs/hr/training/_attachments/*.pdf 2>/dev/null | grep -E '\.pdf$' || true)

# Map required PDFs from changed MD filenames (01..md -> 01..pdf, etc.)
required_pdfs=()
for f in "${md_changed[@]}"; do
  b="$(basename "$f" .md)"
  # Only enforce for the 4 canonical docs
  if [[ "$b" =~ ^0[1-4]_ ]]; then
    required_pdfs+=("docs/hr/training/_attachments/${b}.pdf")
  fi
done

# If only non-canonical MD changed, do not enforce
if [[ "${#required_pdfs[@]}" -eq 0 ]]; then
  echo "[OK] Training Markdown changed, but not canonical numbered policy docs. No PDF sync required."
  exit 0
fi

missing=0
for r in "${required_pdfs[@]}"; do
  if ! printf "%s\n" "${pdf_changed[@]}" | grep -qx "$r"; then
    echo "[FAIL] Markdown changed but PDF not updated: $r"
    missing=1
  fi
done

if [[ "$missing" -eq 1 ]]; then
  echo ""
  echo "Action: regenerate PDFs for changed Markdown and commit updated files under:"
  echo "  docs/hr/training/_attachments/"
  exit 2
fi

echo "[OK] Training PDFs are in sync with Markdown changes."
