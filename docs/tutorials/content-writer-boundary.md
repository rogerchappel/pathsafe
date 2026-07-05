# Content Writer Boundary Demo

This recipe checks a generated content write list before a local agent writes
tutorials or promo drafts to a repository.

## Run it

```sh
bash demo/content-writer-boundary.sh
```

The script builds the CLI, creates a small fixture root, evaluates
`examples/content-write-candidates.jsonl`, and writes a JSONL decision report
under `/tmp`.

## Fixture behavior

- `docs/tutorials/demo.md` is allowed by `docs/tutorials/**`.
- `docs/promo/thread.md` is allowed by `docs/promo/**`.
- `.env` is denied by the `**/.env` deny glob.
- `private/notes.md` is denied by the `private/**` deny glob.
- `../outside-content-root.md` is denied because it escapes the configured root.

The batch command returns non-zero when any candidate is denied. The demo
captures that as expected evidence and verifies the report contains both
allowed and denied reason codes.
