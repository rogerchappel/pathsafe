# pathsafe

`pathsafe` is a tiny local-first TypeScript CLI and library for answering one safety question before a tool touches disk: **is this path allowed inside this root, and why?**

It is designed for CLIs, generators, local agents, and file tools that need deterministic path-boundary checks with readable decisions.

## Features

- Explicit root containment checks
- Allow and deny globs, with deny precedence
- Symlink policies: `follow`, `refuse`, or `ignore`
- `.pathsafe.json` config loading
- JSONL batch checks
- Explainable decision objects with reason codes
- Dependency-light TypeScript library and CLI

## Install

```sh
npm install pathsafe
```

For local development:

```sh
npm install
npm test
```

## CLI

```sh
pathsafe check ./src/index.ts --root . --allow 'src/**' --deny '**/*.secret'
```

Human output:

```text
ALLOW ./src/index.ts (src/index.ts): ALLOW_MATCH - Allowed by pattern src/**.
```

JSON output:

```sh
pathsafe check ./src/index.ts --root . --allow 'src/**' --json
```

Batch JSONL:

```jsonl
{"path":"src/index.ts"}
{"path":"../outside.txt"}
```

```sh
pathsafe batch --root . --input batch.jsonl --json
```

## Config

Create `.pathsafe.json`:

```json
{
  "root": ".",
  "allow": ["src/**", "docs/**", "README.md"],
  "deny": ["**/.env", "secrets/**"],
  "symlinkPolicy": "refuse"
}
```

CLI flags override config values.

## Library

```ts
import { checkPath } from "pathsafe";

const decision = checkPath("src/index.ts", {
  root: process.cwd(),
  allow: ["src/**"],
  deny: ["**/*.secret"],
  symlinkPolicy: "refuse"
});

if (!decision.ok) {
  console.error(decision.reason, decision.message);
}
```

## Symlink policies

- `follow` (default): use the real path when possible and enforce containment on the resolved target.
- `refuse`: deny if any existing path segment is a symlink.
- `ignore`: evaluate the lexical path without resolving symlinks.

Use `refuse` for conservative file-write tools. Use `follow` when reading existing files and you want target containment. Use `ignore` only when a caller has already handled symlink risk.

## Demo recipe

Run the included fixture root through both single-path and JSONL batch checks:

```sh
npm install
npm run build
node dist/src/cli.js check test/fixtures/root/allowed/file.txt --root test/fixtures/root --allow 'allowed/**' --deny 'blocked/**'
node dist/src/cli.js check test/fixtures/root/blocked/secret.txt --root test/fixtures/root --allow 'allowed/**' --deny 'blocked/**' --json
node dist/src/cli.js batch --root test/fixtures/root --input examples/batch.jsonl --allow 'allowed/**' --deny 'blocked/**' --json
```

The fixture shows an allowed file and a denied path under the same root, which
makes the reason codes easy to compare. Commands that include the denied path
exit non-zero by design.

## Reason codes

- `ALLOW_MATCH`
- `DENY_MATCH`
- `NO_ALLOW_MATCH`
- `OUTSIDE_ROOT`
- `SYMLINK_REFUSED`
- `INPUT_MISSING`
- `ROOT_MISSING`
- `CONFIG_ERROR`

## Security model

`pathsafe` is a local validation helper, not an OS sandbox. It does not provide kernel isolation, ACL management, or race-free filesystem authorization. For sensitive writes, validate as close as possible to the actual operation and prefer `symlinkPolicy: "refuse"`.
