#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-examples/agent-root}"

mkdir -p "$ROOT_DIR/workspace/drafts"
touch "$ROOT_DIR/workspace/drafts/README.md"
touch "$ROOT_DIR/workspace/drafts/tutorial.md"
touch "$ROOT_DIR/workspace/.env"

npm run build >/dev/null

echo "Single allowed write candidate:"
node dist/src/cli.js check "$ROOT_DIR/workspace/drafts/README.md" \
  --root "$ROOT_DIR" \
  --allow "workspace/drafts/**" \
  --deny "**/.env" \
  --symlink-policy refuse

echo
echo "Batch write candidates:"
set +e
node dist/src/cli.js batch \
  --root "$ROOT_DIR" \
  --input examples/agent-write-batch.jsonl \
  --allow "workspace/drafts/**" \
  --deny "**/.env" \
  --symlink-policy refuse \
  --json
status=$?
set -e

echo
echo "Batch exit code: $status"
exit 0
