#!/usr/bin/env bash
set -euo pipefail

npm test
npm run check
npm run build
npm run smoke
npm run package:smoke

node dist/src/cli.js check test/fixtures/root/allowed/file.txt \
  --root test/fixtures/root \
  --allow 'allowed/**' \
  --deny 'blocked/**' \
  --symlink-policy refuse \
  --json >/tmp/pathsafe-allowed.json

if [ -L test/fixtures/root/allowed/outside-link ]; then
  if node dist/src/cli.js check test/fixtures/root/allowed/outside-link \
    --root test/fixtures/root \
    --allow 'allowed/**' \
    --symlink-policy refuse >/tmp/pathsafe-link.txt 2>&1; then
    echo "expected symlink refusal to fail" >&2
    exit 1
  fi
fi
