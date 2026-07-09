#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${1:-"$repo_root/.pathsafe-scaffold-boundary"}"

cd "$repo_root"
mkdir -p "$out_dir"
npm run build >/dev/null

set +e
node dist/src/cli.js batch \
  --root examples/scaffold-root \
  --input examples/scaffold-write-candidates.jsonl \
  --allow 'templates/**' \
  --allow 'output/**' \
  --deny 'output/secrets/**' \
  --json > "$out_dir/scaffold-decisions.jsonl"
status=$?
set -e

if [ "$status" -ne 1 ]; then
  echo "expected denied scaffold candidates to exit 1, got $status" >&2
  exit 1
fi

grep -q '"reason":"ALLOW_MATCH"' "$out_dir/scaffold-decisions.jsonl"
grep -q '"reason":"DENY_MATCH"' "$out_dir/scaffold-decisions.jsonl"
grep -q '"reason":"OUTSIDE_ROOT"' "$out_dir/scaffold-decisions.jsonl"

echo "pathsafe scaffold boundary report wrote $out_dir/scaffold-decisions.jsonl"

