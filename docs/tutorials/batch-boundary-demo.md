# Batch Boundary Demo

This tutorial shows Pathsafe's explainable allow/deny decisions using the
repository fixture root and JSONL batch input.

## Build the local CLI

```sh
npm install
npm run build
```

## Check one allowed path

```sh
node dist/src/cli.js check test/fixtures/root/allowed/file.txt \
  --root test/fixtures/root \
  --allow 'allowed/**' \
  --deny 'blocked/**'
```

The human output should include `ALLOW_MATCH`.

## Check one denied path

```sh
node dist/src/cli.js check test/fixtures/root/blocked/secret.txt \
  --root test/fixtures/root \
  --allow 'allowed/**' \
  --deny 'blocked/**' \
  --json
```

The JSON output includes the denied decision and reason code so callers can
surface a precise error instead of a generic path failure. The CLI exits
non-zero for this denied fixture path.

## Run the batch fixture

```sh
node dist/src/cli.js batch \
  --root test/fixtures/root \
  --input examples/batch.jsonl \
  --allow 'allowed/**' \
  --deny 'blocked/**' \
  --json > /tmp/pathsafe-batch.json
test -s /tmp/pathsafe-batch.json
```

Use batch mode when an agent, generator, or file tool has several candidate
paths to validate before touching disk. The included batch fixture contains a
denied path, so a non-zero exit is expected.

## Safety note

Pathsafe is a local validation helper, not an OS sandbox. For sensitive writes,
validate close to the operation and prefer `--symlink-policy refuse`.
