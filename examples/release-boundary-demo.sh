#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/pathsafe-release-boundary-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm run build >/dev/null

echo "== Check one release note candidate =="
node "$ROOT_DIR/dist/src/cli.js" check "$ROOT_DIR/examples/release-root/notes/v0.1.0.md" \
  --root "$ROOT_DIR/examples/release-root" \
  --allow "notes/**" \
  --allow "assets/**" \
  --deny "**/.env" \
  --symlink-policy refuse

echo
echo "== Batch-check release write candidates =="
set +e
node "$ROOT_DIR/dist/src/cli.js" batch \
  --root "$ROOT_DIR/examples/release-root" \
  --input "$ROOT_DIR/examples/release-write-candidates.jsonl" \
  --allow "notes/**" \
  --allow "assets/**" \
  --deny "**/.env" \
  --symlink-policy refuse \
  --json | tee "$OUT_DIR/release-boundary.json"
status=$?
set -e

echo
echo "Batch exit code: $status"
echo "JSON output written to $OUT_DIR/release-boundary.json"
exit 0
