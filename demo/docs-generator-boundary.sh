#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_json="${TMPDIR:-/tmp}/pathsafe-docs-generator-boundary.json"

cd "$repo_root"

mkdir -p examples/docs-generator-root/docs/tutorials
mkdir -p examples/docs-generator-root/docs/reference
mkdir -p examples/docs-generator-root/docs/generated/.cache
mkdir -p examples/docs-generator-root/public/demo
touch examples/docs-generator-root/docs/tutorials/install.md
touch examples/docs-generator-root/docs/reference/options.md
touch examples/docs-generator-root/docs/generated/.cache/report.json
touch examples/docs-generator-root/public/demo/index.html

npm run build

set +e
node dist/src/cli.js batch \
  --root examples/docs-generator-root \
  --input examples/docs-generator-candidates.jsonl \
  --allow "docs/tutorials/**" \
  --allow "docs/reference/**" \
  --allow "public/demo/**" \
  --deny "docs/generated/.cache/**" \
  --symlink-policy refuse \
  --json > "$out_json"
status=$?
set -e

test -s "$out_json"
grep -q "ALLOW_MATCH" "$out_json"
grep -q "DENY_MATCH" "$out_json"
grep -q "OUTSIDE_ROOT" "$out_json"

echo "Docs-generator boundary report: $out_json"
echo "Expected batch exit: $status"
