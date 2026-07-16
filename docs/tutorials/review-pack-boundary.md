# Review Pack Boundary Demo

This recipe frames `pathsafe` around a review-pack workflow. The allowed files
are proof artifacts and handoff notes; secrets and paths outside the review
directory are denied.

## Run it

```sh
bash demo/review-pack-boundary.sh
```

The script creates a temporary review-pack root, runs a JSONL batch check, and
verifies that the report includes:

- `ALLOW_MATCH` for `proof/**` and `notes/**`
- `DENY_MATCH` for `secrets/**`
- `OUTSIDE_ROOT` for a path that escapes the review-pack directory

The batch exits non-zero because denied candidates are expected in the fixture.
