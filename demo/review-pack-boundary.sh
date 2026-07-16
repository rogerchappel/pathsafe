#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/pathsafe-review-pack"
demo_root="$out_dir/review-pack"

cd "$repo_root"
rm -rf "$out_dir"
mkdir -p "$demo_root/proof" "$demo_root/notes" "$demo_root/secrets"
touch "$demo_root/proof/summary.md"
touch "$demo_root/notes/handoff.md"
touch "$demo_root/secrets/token.txt"

cat > "$out_dir/review-pack-candidates.jsonl" <<JSONL
{"path":"$demo_root/proof/summary.md"}
{"path":"$demo_root/notes/handoff.md"}
{"path":"$demo_root/secrets/token.txt"}
{"path":"$demo_root/../outside.md"}
JSONL

npm run build

set +e
node dist/src/cli.js batch \
  --root "$demo_root" \
  --input "$out_dir/review-pack-candidates.jsonl" \
  --allow "proof/**" \
  --allow "notes/**" \
  --deny "secrets/**" \
  --symlink-policy refuse \
  --json > "$out_dir/review-pack-report.json"
status=$?
set -e

test "$status" -ne 0
grep -q "ALLOW_MATCH" "$out_dir/review-pack-report.json"
grep -q "DENY_MATCH" "$out_dir/review-pack-report.json"
grep -q "OUTSIDE_ROOT" "$out_dir/review-pack-report.json"

echo "Review pack boundary report: $out_dir/review-pack-report.json"
echo "Expected mixed batch exit: $status"
