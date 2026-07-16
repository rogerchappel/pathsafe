# Review Pack Boundary Hooks

Grounded demo: `bash demo/review-pack-boundary.sh`

## Short hooks

- Review packs should include proof and notes, not secrets. `pathsafe` can make
  that file boundary explicit before anything writes to disk.
- This demo batch has two allowed paths, one denied secret path, and one path
  outside the review root. The report names each reason.
- `pathsafe` is useful when a local agent has candidate file paths but needs a
  deterministic yes/no decision before touching them.

## Video beat

1. Show the temporary review-pack paths in the script.
2. Run `bash demo/review-pack-boundary.sh`.
3. Open the JSON report and compare `ALLOW_MATCH`, `DENY_MATCH`, and
   `OUTSIDE_ROOT`.
