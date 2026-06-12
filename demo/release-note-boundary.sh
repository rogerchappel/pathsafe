#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_JSON="${TMPDIR:-/tmp}/pathsafe-release-boundary.json"

cd "$ROOT_DIR"

mkdir -p examples/release-root/notes examples/release-root/assets
touch examples/release-root/notes/v0.1.0.md
touch examples/release-root/assets/screenshot.png
touch examples/release-root/notes/.env

npm run build

set +e
node dist/src/cli.js batch \
  --root examples/release-root \
  --input examples/release-write-candidates.jsonl \
  --allow "notes/**" \
  --allow "assets/**" \
  --deny "**/.env" \
  --symlink-policy refuse \
  --json > "$OUT_JSON"
status=$?
set -e

test -s "$OUT_JSON"
grep -q "ALLOW_MATCH" "$OUT_JSON"
grep -q "DENY_MATCH" "$OUT_JSON"
grep -q "OUTSIDE_ROOT" "$OUT_JSON"

echo "Boundary report: $OUT_JSON"
echo "Expected batch exit: $status"
