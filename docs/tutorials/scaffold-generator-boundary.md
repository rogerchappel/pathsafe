# Bound a Scaffold Generator

Scaffold tools often need to write files into a predictable project shape:
templates, generated output, and docs are fine; secrets and parent-directory
escapes are not.

This recipe uses `pathsafe batch` to review a JSONL list of candidate writes
before a generator would touch disk.

## Run it

```sh
bash demo/scaffold-generator-boundary.sh
```

The demo writes `.pathsafe-scaffold-boundary/scaffold-decisions.jsonl` and
expects denied candidates to make the CLI exit `1`.

## Fixture policy

- Allow `templates/**` and `output/**`.
- Deny `output/secrets/**` even though `output/**` is otherwise allowed.
- Deny `../outside-workspace.txt` because it escapes the configured root.

The result is a compact, machine-readable report that can be attached to a PR
or used as a preflight step before a local generator writes files.

