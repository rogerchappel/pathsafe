# Social Hook Pack: Pathsafe

Use these as draft copy for posts, README callouts, or short video captions.
They are grounded in the current CLI and library behavior.

## Hooks

- Before a local agent writes a file, ask the boring question: is this path
  inside the allowed root, and why? Pathsafe returns an explainable decision.
- Path traversal checks are easier to trust when the denial has a reason code.
  Pathsafe reports `OUTSIDE_ROOT`, `DENY_MATCH`, `NO_ALLOW_MATCH`, and more.
- Pathsafe gives CLIs and generators a small local boundary check with allow
  globs, deny globs, symlink policies, and JSONL batch mode.
- A path guard is not an OS sandbox, but it can stop obvious bad writes before
  your tool reaches the filesystem operation.

## Demo command

```sh
npm run build
node dist/src/cli.js batch --root test/fixtures/root --input examples/batch.jsonl --allow 'allowed/**' --deny 'blocked/**' --json
```

## Limits to say plainly

Pathsafe does not provide kernel isolation, ACL management, or race-free
filesystem authorization. It is a deterministic local validation helper.
