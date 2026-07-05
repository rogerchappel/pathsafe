# Content Writer Boundary Social Hooks

Grounded promotion notes for `demo/content-writer-boundary.sh`.

## Short posts

1. Content generators still need filesystem boundaries. This `pathsafe` demo
   allows docs/tutorials and docs/promo drafts while denying `.env`, private
   notes, and outside-root writes.
2. The report is the artifact: every candidate write gets an explainable reason
   code before an agent or generator touches disk.
3. A repo-content workflow can stay local and reviewable: generate candidate
   paths, run `pathsafe batch`, attach the JSONL evidence.

## Video beat

- Show `examples/content-write-candidates.jsonl`.
- Run `bash demo/content-writer-boundary.sh`.
- Open `/tmp/pathsafe-content-writer-boundary.json`.
- Highlight the contrast between `ALLOW_MATCH`, `DENY_MATCH`, and
  `OUTSIDE_ROOT`.

## Caption

`pathsafe` gives generated docs and promo drafts a small, explainable write
boundary before any file operation happens.
