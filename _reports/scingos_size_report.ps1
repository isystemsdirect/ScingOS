param(
  [string]$ROOT = "C:\Users\maste\SCINGOS_WORK\ScingOS",
  [int]$LINES_PER_PAGE = 50
)

$ErrorActionPreference = 'Stop'

$EXCLUDE_DIRS = @(
  "\\.git\\",
  "\\node_modules\\",
  "\\.next\\",
  "\\dist\\",
  "\\build\\",
  "\\out\\",
  "\\coverage\\",
  "\\.turbo\\",
  "\\.cache\\",
  "\\.scing\\",
  "\\.scingular\\"
)

$CODE_EXT = @(
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".ps1", ".sh", ".bash", ".zsh", ".cmd", ".bat",
  ".go", ".rs", ".java", ".kt", ".swift", ".cs", ".cpp", ".c", ".h",
  ".json", ".yml", ".yaml", ".toml", ".ini", ".env", ".sql",
  ".mdx"
)

$DOC_EXT = @(
  ".md", ".txt", ".rst", ".adoc",
  ".pdf", ".docx"
)

function IsExcludedPath([string]$p) {
  foreach ($x in $EXCLUDE_DIRS) {
    if ($p -match $x) { return $true }
  }
  return $false
}

function FastLineCount([string]$path) {
  try {
    $fs = [System.IO.File]::OpenRead($path)
    try {
      $buffer = New-Object byte[] 65536
      [long]$lines = 0
      [int]$read = 0
      [byte]$lastByte = 0
      [bool]$hasAny = $false

      while (($read = $fs.Read($buffer, 0, $buffer.Length)) -gt 0) {
        $hasAny = $true
        $lastByte = $buffer[$read - 1]
        for ($i = 0; $i -lt $read; $i++) {
          if ($buffer[$i] -eq 10) { $lines++ } # '\n'
        }
      }

      if (-not $hasAny) { return 0 }
      if ($lastByte -ne 10) { $lines++ } # count final line without trailing newline
      return $lines
    } finally {
      $fs.Dispose()
    }
  } catch {
    return 0
  }
}

function SafeLineCount([string]$path, [string]$ext) {
  $e = $ext.ToLowerInvariant()
  if ($e -eq ".pdf" -or $e -eq ".docx") { return 0 }
  return FastLineCount $path
}

$all = Get-ChildItem -LiteralPath $ROOT -Recurse -File -Force -ErrorAction Stop |
  Where-Object { -not (IsExcludedPath $_.FullName) }

$docs = $all | Where-Object { $DOC_EXT -contains $_.Extension.ToLowerInvariant() }
$code = $all | Where-Object { $CODE_EXT -contains $_.Extension.ToLowerInvariant() }

$docsStats = $docs | ForEach-Object {
  $lc = SafeLineCount $_.FullName $_.Extension
  [pscustomobject]@{ Path=$_.FullName; Ext=$_.Extension; Lines=$lc }
}

$codeStats = $code | ForEach-Object {
  $lc = SafeLineCount $_.FullName $_.Extension
  [pscustomobject]@{ Path=$_.FullName; Ext=$_.Extension; Lines=$lc }
}

$docsLines = ($docsStats | Measure-Object -Property Lines -Sum).Sum
$codeLines = ($codeStats | Measure-Object -Property Lines -Sum).Sum
$totalLines = $docsLines + $codeLines

$docsPages  = [math]::Ceiling(($docsLines  / [double]$LINES_PER_PAGE))
$codePages  = [math]::Ceiling(($codeLines  / [double]$LINES_PER_PAGE))
$totalPages = [math]::Ceiling(($totalLines / [double]$LINES_PER_PAGE))

$codeByExt = $codeStats | Group-Object Ext | Sort-Object Count -Descending | Select-Object -First 20
$docsByExt = $docsStats | Group-Object Ext | Sort-Object Count -Descending | Select-Object -First 20

"`n================ SCINGOS PROJECT SIZE REPORT ================"
"Root: $ROOT"
"Line-to-page: $LINES_PER_PAGE lines = 1 page"
"Excluded dirs: $($EXCLUDE_DIRS -join ', ')"
"-------------------------------------------------------------"
"CODE  files: {0,8}  lines: {1,12:N0}  pages: {2,8:N0}" -f $code.Count, $codeLines, $codePages
"DOCS  files: {0,8}  lines: {1,12:N0}  pages: {2,8:N0}" -f $docs.Count, $docsLines, $docsPages
"TOTAL files: {0,8}  lines: {1,12:N0}  pages: {2,8:N0}" -f ($code.Count+$docs.Count), $totalLines, $totalPages
"=============================================================`n"

"Top CODE extensions (count):"
$codeByExt | ForEach-Object { "  {0,-6} {1,8}" -f $_.Name, $_.Count }

"`nTop DOCS extensions (count):"
$docsByExt | ForEach-Object { "  {0,-6} {1,8}" -f $_.Name, $_.Count }

$OUTDIR = Join-Path $ROOT "_reports"
New-Item -ItemType Directory -Force -Path $OUTDIR | Out-Null

$docsStats | Sort-Object Lines -Descending | Export-Csv -NoTypeInformation -Encoding UTF8 (Join-Path $OUTDIR "docs_lines.csv")
$codeStats | Sort-Object Lines -Descending | Export-Csv -NoTypeInformation -Encoding UTF8 (Join-Path $OUTDIR "code_lines.csv")

"`nWrote:"
"  $(Join-Path $OUTDIR 'docs_lines.csv')"
"  $(Join-Path $OUTDIR 'code_lines.csv')"

# ============================
# B) OPTIONAL: GIT-TRACKED ONLY
# ============================
try {
  $tracked = git -C $ROOT ls-files

  $trackedFull = $tracked | ForEach-Object { Join-Path $ROOT $_ }
  $trackedFiles = $trackedFull | Where-Object { Test-Path $_ -PathType Leaf } |
    Where-Object { -not (IsExcludedPath $_) }

  $trackedDocs = $trackedFiles | Where-Object { $DOC_EXT -contains ([IO.Path]::GetExtension($_).ToLowerInvariant()) }
  $trackedCode = $trackedFiles | Where-Object { $CODE_EXT -contains ([IO.Path]::GetExtension($_).ToLowerInvariant()) }

  $trackedDocsLines = ($trackedDocs | ForEach-Object { SafeLineCount $_ ([IO.Path]::GetExtension($_)) } | Measure-Object -Sum).Sum
  $trackedCodeLines = ($trackedCode | ForEach-Object { SafeLineCount $_ ([IO.Path]::GetExtension($_)) } | Measure-Object -Sum).Sum

  "`n================ GIT-TRACKED SIZE REPORT ===================="
  "CODE tracked files: {0,8}  lines: {1,12:N0}  pages: {2,8:N0}" -f $trackedCode.Count, $trackedCodeLines, [math]::Ceiling($trackedCodeLines/$LINES_PER_PAGE)
  "DOCS tracked files: {0,8}  lines: {1,12:N0}  pages: {2,8:N0}" -f $trackedDocs.Count, $trackedDocsLines, [math]::Ceiling($trackedDocsLines/$LINES_PER_PAGE)
  "TOTAL tracked lines: {0,12:N0}  pages: {1,8:N0}" -f ($trackedDocsLines+$trackedCodeLines), [math]::Ceiling(($trackedDocsLines+$trackedCodeLines)/$LINES_PER_PAGE)
  "=============================================================`n"
}
catch {
  "`n(Git-tracked report skipped: git not available or repo not initialized.)`n"
}
