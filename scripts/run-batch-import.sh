#!/usr/bin/env bash
# Usage: ./scripts/run-batch-import.sh path/to/large.json [lines_per_chunk] [concurrency]
# Converts a JSON array to NDJSON (if needed), splits into chunks, runs importer on each chunk,
# and merges import-report.json files into combined-report.json

set -euo pipefail

# determine project scripts dir reliably (use BASH_SOURCE to get script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FILE="$1"
LINES_PER_CHUNK=${2:-500}
CONCURRENCY=${3:-4}

if [ -z "$FILE" ]; then
  echo "Usage: $0 path/to/file.json [lines_per_chunk] [concurrency]"
  exit 1
fi

TMPDIR=$(mktemp -d)
echo "Working in $TMPDIR"

NDJSON="$TMPDIR/input.ndjson"

if file --mime-type "$FILE" | grep -q json$; then
  # try to detect if it's a JSON array
  if head -n1 "$FILE" | grep -q '^\s*\['; then
    echo "Converting JSON array to NDJSON (this may take a while)..."
    jq -c '.[]' "$FILE" > "$NDJSON"
  else
    echo "Assuming input is already NDJSON; copying to temp"
    cp "$FILE" "$NDJSON"
  fi
else
  echo "Input looks binary or unknown; assuming NDJSON and copying"
  cp "$FILE" "$NDJSON"
fi

cd "$TMPDIR"
# macOS `split` is BSD; use portable flags and rename output files to have consistent suffix
split -l "$LINES_PER_CHUNK" -a 4 "$NDJSON" chunk_
i=0
for f in chunk_*; do
  idx=$(printf "%04d" "$i")
  mv "$f" "chunk_${idx}.ndjson"
  i=$((i+1))
done
echo "Split into files:"
ls -1 chunk_*.ndjson


export SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY

SUP_SCRIPT="$SCRIPT_DIR/supabase-upsert.js"

run_chunk() {
  CHUNK="$1"
  echo "Processing $CHUNK"
  node "$SUP_SCRIPT" --file "$TMPDIR/$CHUNK" --write
  # move report if exists
  if [ -f import-report.json ]; then
    mv import-report.json "$CHUNK.report.json"
  fi
  # copy any report files created in TMPDIR to workspace root
  for r in "$TMPDIR"/*.report.json; do
    if [ -f "$r" ]; then
      cp "$r" "$WORKSPACE_ROOT/$(basename "$r")" || true
    fi
  done
}

export -f run_chunk

ls chunk_*.ndjson | xargs -n1 -P "$CONCURRENCY" -I{} bash -c 'run_chunk "{}"'

echo "Merging reports..."
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# copy any chunk reports back to workspace before merging
for r in *.report.json; do
  if [ -f "$r" ]; then
    cp "$r" "$WORKSPACE_ROOT/$r"
  fi
done

cd "$WORKSPACE_ROOT"
jq -s '{ total: (map(.total) | add), valid: (map(.valid) | add), invalid: (map(.invalid) | add), errors: (map(.errors) | add) }' *.report.json > combined-report.json || echo '{}' > combined-report.json

echo "Combined report written to $WORKSPACE_ROOT/combined-report.json"
echo "You can inspect it: cat $WORKSPACE_ROOT/combined-report.json"

echo "Cleaning up temp chunk files..."
# keep combined-report.json
find . -maxdepth 1 -name 'chunk_*.ndjson' -delete

echo "Done."
