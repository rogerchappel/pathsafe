# Agent Write Boundary Report

This runnable demo turns Pathsafe's agent-write fixture into two review
artifacts: a single allowed write decision and a batch report with denied
boundaries.

## Run it

```sh
npm install
bash demo/agent-write-boundary-report.sh
```

The script builds the CLI, creates a temporary agent root, writes
`single-allow.json`, then runs `examples/agent-write-batch.jsonl` and confirms
that the batch gate exits non-zero.

## What to inspect

- `ALLOW_MATCH` for `workspace/drafts/README.md`
- `DENY_MATCH` for `.env`
- `OUTSIDE_ROOT` for a path traversal candidate

Use this when demonstrating how an agent file tool can record explainable
decisions before touching disk.
