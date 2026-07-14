# Release Note PR Evidence

Use this checklist when the release-note boundary demo is used as PR support
material.

## Command

```sh
bash demo/release-note-boundary.sh
```

## What to attach

- The path printed after `Boundary report:`.
- The script output line beginning `Expected batch exit:`.
- The candidate list in `examples/release-write-candidates.jsonl`.

## What the evidence means

- `ALLOW_MATCH` proves that expected note and asset paths matched the allow
  globs.
- `DENY_MATCH` proves that the `.env` candidate lost to deny precedence.
- `OUTSIDE_ROOT` proves that traversal outside `examples/release-root` was
  rejected.

The batch command exits non-zero because the demo intentionally includes denied
candidates. The wrapper script succeeds only after those denials are present in
the report.
