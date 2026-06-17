# Social Thread: Bound Agent File Writes

Use this as grounded draft copy for a short thread or carousel. It is based on
`examples/agent-write-demo.sh`, `examples/agent-write-batch.jsonl`, and the
README security model.

## Thread Draft

1. Before a local agent writes a file, ask one narrow question: is this path
   allowed inside the intended root, and why?

2. `pathsafe` answers with root containment, allow globs, deny globs, and a
   symlink policy. The CLI can check one path or a JSONL batch of candidate
   writes.

3. The demo creates draft files, an `.env`, and an outside-root path. The draft
   paths are allowed; the sensitive and out-of-boundary paths are denied with
   reason codes.

4. Run it locally:

   ```sh
   bash examples/agent-write-demo.sh
   ```

5. Important limit: Pathsafe is not an OS sandbox. It is a deterministic local
   validation helper that should run close to the actual file operation.

## Screenshot Beats

- `examples/agent-write-batch.jsonl` showing the candidate writes.
- Terminal output from `bash examples/agent-write-demo.sh`.
- README security model paragraph that says Pathsafe is not kernel isolation.
