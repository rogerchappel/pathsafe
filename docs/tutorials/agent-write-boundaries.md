# Agent Write Boundaries

This recipe shows how `pathsafe` can gate file-write candidates before a local agent or generator touches disk.

## Files

- `examples/agent-write-demo.sh`: runnable demo that creates a tiny root, checks one allowed path, then batch-checks four write candidates.
- `examples/agent-write-batch.jsonl`: JSONL input with allowed draft files under `examples/agent-root`, an `.env` denial, and an outside-root denial.

## Run the demo

```bash
bash examples/agent-write-demo.sh
```

The script builds the CLI, creates `examples/agent-root`, and runs:

```bash
node dist/src/cli.js check examples/agent-root/workspace/drafts/README.md \
  --root examples/agent-root \
  --allow "workspace/drafts/**" \
  --deny "**/.env" \
  --symlink-policy refuse

node dist/src/cli.js batch \
  --root examples/agent-root \
  --input examples/agent-write-batch.jsonl \
  --allow "workspace/drafts/**" \
  --deny "**/.env" \
  --symlink-policy refuse \
  --json
```

## Expected review signals

The draft files should be allowed because they match `workspace/drafts/**`. The `.env` candidate should be denied by the deny glob. The `../outside-workspace.txt` candidate should be denied because it escapes the configured root.

The batch command exits non-zero when any candidate is denied, which is useful for a pre-write guard. The demo prints that exit code and then exits successfully so it can be used as a documentation smoke test.

## Where this helps

- coding-agent file tools that need a deterministic root boundary
- repository generators that should only write under selected folders
- local CLIs that want human-readable reason codes before refusing a path
