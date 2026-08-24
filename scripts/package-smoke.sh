#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/pathsafe-package-smoke.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

cd "$repo_root"
npm run build >/dev/null
pack_json="$(npm pack --json --pack-destination "$tmp_dir")"
tarball="$(node -e "const data = JSON.parse(process.argv[1]); console.log(data[0].filename)" "$pack_json")"

node -e "const data = JSON.parse(process.argv[1]); if (data[0].name !== '@rogerchappel/pathsafe') { console.error('Unexpected packed package identity: ' + data[0].name); process.exit(1); }" "$pack_json"
grep -Fq 'The npm package has not been released yet.' README.md
grep -Fq 'tarball="$(npm pack --silent)"' README.md
grep -Fq 'install_prefix="$(mktemp -d)"' README.md
grep -Fq 'npm install --prefix "$install_prefix" "./$tarball"' README.md
grep -Fq '"$install_prefix/node_modules/.bin/pathsafe" check README.md' README.md
grep -Fq 'After the package is released to the npm registry' README.md
grep -Fq 'npm install @rogerchappel/pathsafe' README.md
grep -Fq 'from "@rogerchappel/pathsafe"' README.md
node -e "const data = JSON.parse(process.argv[1]); const files = new Set(data[0].files.map((file) => file.path)); for (const required of ['dist/src/cli.js', 'dist/src/index.js', 'README.md', 'LICENSE', 'SECURITY.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md', 'ROADMAP.md', 'docs/tutorials/agent-write-boundaries.md', 'demo/agent-write-boundary-report.sh', 'examples/batch-allow.jsonl']) { if (!files.has(required)) { console.error('Missing package file: ' + required); process.exit(1); } }" "$pack_json"

install_prefix="$tmp_dir/install-prefix"
fixture_root="$tmp_dir/fixture-root"
mkdir -p "$install_prefix" "$fixture_root/allowed" "$fixture_root/blocked"
printf 'ok\n' > "$fixture_root/allowed/file.txt"
printf 'secret\n' > "$fixture_root/blocked/secret.txt"
printf '{"path":"allowed/file.txt"}\n' > "$fixture_root/batch.jsonl"

npm install --prefix "$install_prefix" "$tmp_dir/$tarball" >/dev/null

NODE_PATH="$install_prefix/node_modules" node -e "import('$install_prefix/node_modules/@rogerchappel/pathsafe/dist/src/index.js').then((mod) => { if (typeof mod.checkPath !== 'function') process.exit(1); })"
"$install_prefix/node_modules/.bin/pathsafe" check "$fixture_root/allowed/file.txt" --root "$fixture_root" --allow 'allowed/**' --deny 'blocked/**' >/dev/null
"$install_prefix/node_modules/.bin/pathsafe" batch --root "$fixture_root" --input "$fixture_root/batch.jsonl" --allow 'allowed/**' --deny 'blocked/**' --json >/dev/null

printf 'pathsafe package smoke passed\n'
