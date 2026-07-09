# Scaffold Generator Boundary Hooks

- Before a scaffold command writes files, ask one question: is each target path
  inside the intended root, and why?
- `pathsafe batch` turns a JSONL write plan into explainable allow/deny
  decisions for generator preflights.
- Demo angle: allow templates and generated output, deny `output/secrets/**`,
  and catch a parent-directory escape in the same report.
- Strong visual: show a four-line write plan becoming JSONL evidence with
  `ALLOW_MATCH`, `DENY_MATCH`, and `OUTSIDE_ROOT` reason codes.

