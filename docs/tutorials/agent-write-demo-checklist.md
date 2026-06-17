# Agent Write Demo Checklist

Use this checklist when recording or validating the agent write-boundary demo.

## Setup

```sh
npm install
npm run build
```

## Demo Command

```sh
bash examples/agent-write-demo.sh
```

The script creates a local demo root under `examples/agent-root` by default,
checks one allowed draft path, then batch-checks `examples/agent-write-batch.jsonl`.

## What to Verify

- The single-path check allows `workspace/drafts/README.md`.
- The batch output includes allowed draft files.
- The batch output denies `workspace/.env`.
- The batch output denies the outside-root candidate.
- The script prints the batch exit code instead of failing the whole walkthrough
  when denials are expected.

## Cleanup

```sh
rm -rf examples/agent-root
```

The generated root is ignored by the demo flow and should not be committed.
