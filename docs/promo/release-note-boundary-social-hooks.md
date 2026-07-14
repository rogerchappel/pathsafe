# Release Note Boundary Social Hooks

Grounded promotion notes for `demo/release-note-boundary.sh`.

## Short posts

1. Release-note generators still need filesystem boundaries. This pathsafe demo
   checks Markdown, screenshot, `.env`, and outside-root write candidates before
   anything writes to disk.
2. The useful part of a path check is the reason code. The release-note demo
   captures `ALLOW_MATCH`, `DENY_MATCH`, and `OUTSIDE_ROOT` in one JSONL report.
3. A safer agent workflow can be small: pass candidate writes through pathsafe,
   keep denies explainable, and attach the report to the PR.

## Video beat

- Show `examples/release-write-candidates.jsonl`.
- Run `bash demo/release-note-boundary.sh`.
- Open the generated `/tmp/pathsafe-release-boundary.json` file.
- Point out that denied candidates are expected and make the batch exit
  non-zero, while the demo script treats that as verification evidence.

## Caption

`pathsafe` turns a release-note write list into explainable allow/deny evidence
before the generator touches the filesystem.
