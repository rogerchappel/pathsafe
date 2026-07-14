# Docs Generator Boundary Hooks

## Short posts

- Before a docs generator writes files, ask one local question: is every planned
  path inside the repo area it is allowed to touch?
- This `pathsafe` demo allows tutorials, reference docs, and public demo HTML,
  while denying cache output and root escapes.
- The JSONL report is review evidence: every candidate gets an allow or deny
  reason code.

## Clip outline

1. Show the five candidate paths in `examples/docs-generator-candidates.jsonl`.
2. Run `bash demo/docs-generator-boundary.sh`.
3. Open the JSONL report and highlight `ALLOW_MATCH`, `DENY_MATCH`, and
   `OUTSIDE_ROOT`.
4. Close on the limitation: `pathsafe` explains path decisions, but it is not an
   operating-system sandbox.
