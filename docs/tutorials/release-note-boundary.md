# Release Note Boundary Demo

This recipe checks a small batch of release-note write candidates before a
generator writes Markdown or assets to disk.

## Run it

```sh
bash demo/release-note-boundary.sh
```

The script builds the CLI, evaluates `examples/release-write-candidates.jsonl`,
and writes a JSON decision report under `/tmp`.

## Fixture behavior

- `examples/release-root/notes/v0.1.0.md` is allowed by the `notes/**` allow glob.
- `examples/release-root/assets/screenshot.png` is allowed by the `assets/**` allow glob.
- `examples/release-root/notes/.env` is denied by the `**/.env` deny glob.
- `../outside-release.txt` is denied because it escapes the configured root.

The batch command returns non-zero when any candidate is denied. The demo treats
that as expected and verifies the report contains `ALLOW_MATCH`, `DENY_MATCH`,
and `OUTSIDE_ROOT`.
