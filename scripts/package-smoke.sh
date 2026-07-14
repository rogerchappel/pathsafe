#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/pathsafe-package-smoke.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

cd "$repo_root"
npm run build >/dev/null
pack_json="$(npm pack --json --pack-destination "$tmp_dir")"
tarball="$(node -e "const data = JSON.parse(process.argv[1]); console.log(data[0].filename)" "$pack_json")"

node -e "const data = JSON.parse(process.argv[1]); const files = new Set(data[0].files.map((file) => file.path)); for (const required of ['dist/src/cli.js', 'dist/src/index.js', 'README.md', 'LICENSE', 'SECURITY.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md', 'ROADMAP.md', 'docs/tutorials/agent-write-boundaries.md', 'demo/agent-write-boundary-report.sh', 'examples/batch-allow.jsonl']) { if (!files.has(required)) { console.error('Missing package file: ' + required); process.exit(1); } }" "$pack_json"

mkdir -p "$tmp_dir/app/root/allowed" "$tmp_dir/app/root/blocked"
printf 'ok\n' > "$tmp_dir/app/root/allowed/file.txt"
printf 'secret\n' > "$tmp_dir/app/root/blocked/secret.txt"
printf '{"path":"allowed/file.txt"}\n' > "$tmp_dir/app/batch.jsonl"

cd "$tmp_dir/app"
npm init -y >/dev/null
npm install "$tmp_dir/$tarball" >/dev/null

node -e "import('pathsafe').then((mod) => { if (typeof mod.checkPath !== 'function') process.exit(1); })"
./node_modules/.bin/pathsafe check root/allowed/file.txt --root root --allow 'allowed/**' --deny 'blocked/**' >/dev/null
./node_modules/.bin/pathsafe batch --root root --input batch.jsonl --allow 'allowed/**' --deny 'blocked/**' --json >/dev/null

printf 'pathsafe package smoke passed\n'
