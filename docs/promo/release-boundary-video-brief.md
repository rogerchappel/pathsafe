# Video Brief: Release File Boundary Checks

## Positioning

Show `pathsafe` guarding a release-note workflow before a generator writes files
into a release directory.

## Grounded demo beats

1. Open `examples/release-write-candidates.jsonl`.
2. Show the four candidates: a release note, an asset screenshot, a denied
   `.env`, and an outside-root path.
3. Run `npm run build`.
4. Run `bash examples/release-boundary-demo.sh`.
5. Point out the allowed `notes/**` and `assets/**` globs, the `**/.env` deny
   glob, and `--symlink-policy refuse`.
6. Show the batch JSON output and the non-zero batch status, then note that the
   demo exits successfully so docs can smoke-test the expected denial path.

## Demo script

```sh
npm run build
bash examples/release-boundary-demo.sh
```

## What to say plainly

- `pathsafe` returns explainable allow/deny decisions.
- Deny rules take precedence over allow rules.
- The tool is a local validation helper, not an OS sandbox.
