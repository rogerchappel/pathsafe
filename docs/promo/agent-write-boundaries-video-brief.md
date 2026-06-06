# Video Brief: Bound File Writes Before They Happen

## Angle

Show a local agent preparing four write paths: two draft files, one `.env`, and one path outside the root. `pathsafe` explains which writes are allowed and why the others are denied.

## Grounded product facts

- `pathsafe` is a TypeScript CLI and library.
- It checks root containment, allow globs, deny globs, and symlink policy.
- It supports single-path checks and JSONL batch checks.
- It returns explainable decision objects with reason codes.
- It is a local validation helper, not an OS sandbox.

## Demo flow

1. Open `examples/agent-write-batch.jsonl`.
2. Run `bash examples/agent-write-demo.sh`.
3. Show the allowed draft paths.
4. Show the `.env` denial and outside-root denial.
5. Explain that callers still validate near the actual operation because this is not kernel isolation.

## Short hooks

- "Before a local agent writes files, ask one boring question: is this path inside the boundary?"
- "Allow globs, deny globs, root checks, and symlink policy in one deterministic decision."
- "A pre-write path guard should explain the denial, not just throw."
