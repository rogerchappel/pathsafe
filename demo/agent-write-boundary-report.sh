#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/pathsafe-demo"
demo_root="$out_dir/agent-root"

cd "$repo_root"
rm -rf "$out_dir"
mkdir -p "$demo_root/workspace/drafts"
touch "$demo_root/workspace/drafts/README.md"
touch "$demo_root/workspace/drafts/tutorial.md"
touch "$demo_root/workspace/.env"
cat > "$out_dir/batch.jsonl" <<JSONL
{"path":"$demo_root/workspace/drafts/README.md"}
{"path":"$demo_root/workspace/drafts/tutorial.md"}
{"path":"$demo_root/workspace/.env"}
{"path":"$demo_root/../outside-workspace.txt"}
JSONL

npm run build

node dist/src/cli.js check "$demo_root/workspace/drafts/README.md" \
  --root "$demo_root" \
  --allow "workspace/drafts/**" \
  --deny "**/.env" \
  --symlink-policy refuse \
  --json > "$out_dir/single-allow.json"

set +e
node dist/src/cli.js batch \
  --root "$demo_root" \
  --input "$out_dir/batch.jsonl" \
  --allow "workspace/drafts/**" \
  --deny "**/.env" \
  --symlink-policy refuse \
  --json > "$out_dir/batch-boundary.json"
batch_status=$?
set -e

test "$batch_status" -ne 0
test -s "$out_dir/single-allow.json"
test -s "$out_dir/batch-boundary.json"
grep -q "ALLOW_MATCH" "$out_dir/single-allow.json"
grep -q "DENY_MATCH" "$out_dir/batch-boundary.json"
grep -q "OUTSIDE_ROOT" "$out_dir/batch-boundary.json"

echo "Single allow report: $out_dir/single-allow.json"
echo "Batch boundary report: $out_dir/batch-boundary.json"
echo "Expected batch gate exit: $batch_status"
