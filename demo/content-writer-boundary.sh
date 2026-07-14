#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_json="${TMPDIR:-/tmp}/pathsafe-content-writer-boundary.json"

cd "$repo_root"

mkdir -p examples/content-writer-root/docs/tutorials
mkdir -p examples/content-writer-root/docs/promo
mkdir -p examples/content-writer-root/private
touch examples/content-writer-root/docs/tutorials/demo.md
touch examples/content-writer-root/docs/promo/thread.md
touch examples/content-writer-root/.env
touch examples/content-writer-root/private/notes.md

npm run build

set +e
node dist/src/cli.js batch \
  --root examples/content-writer-root \
  --input examples/content-write-candidates.jsonl \
  --allow "docs/tutorials/**" \
  --allow "docs/promo/**" \
  --deny "**/.env" \
  --deny "private/**" \
  --symlink-policy refuse \
  --json > "$out_json"
status=$?
set -e

test -s "$out_json"
grep -q "ALLOW_MATCH" "$out_json"
grep -q "DENY_MATCH" "$out_json"
grep -q "OUTSIDE_ROOT" "$out_json"

echo "Content-writer boundary report: $out_json"
echo "Expected batch exit: $status"
